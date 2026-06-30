/**
 * rakuten.js — 楽天市場 商品検索API
 *
 * 商品名またはURLから楽天APIで商品情報を取得する。
 * 取得データ: 商品名・価格・画像・レビュー件数・レビュー平均・楽天URL
 */

const RAKUTEN_API_BASE = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';

// 楽天URLから商品アイテムコードを抽出（楽天URLが渡された場合）
function extractItemCodeFromUrl(url) {
  if (!url) return null;
  // https://item.rakuten.co.jp/shop/item-code/ 形式
  const match = url.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?#]+)/);
  if (match) return match[2];
  return null;
}

// URLから検索キーワードを推定（楽天以外のURLが渡された場合）
function inferKeywordFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Amazonの場合: /dp/ASIN/
    const asin = u.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    if (asin) return null; // ASINは楽天検索に使えない

    // パス末尾の単語を使う（粗い推定）
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1]?.replace(/[-_]/g, ' ') || null;
  } catch {
    return null;
  }
}

/**
 * 楽天APIで商品を検索する
 *
 * @param {object} params
 * @param {string} [params.keyword]   - 検索キーワード（商品名）
 * @param {string} [params.rakutenUrl] - 楽天商品URL（itemCode抽出に使用）
 * @param {string} [params.urls]       - URL群（フォールバック）
 * @param {number} [params.hits=3]     - 取得件数
 * @returns {Promise<RakutenResult>}
 */
export async function searchRakuten({ keyword, rakutenUrl, urls = {}, hits = 3 }) {
  const appId = process.env.RAKUTEN_APP_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId) {
    return { ok: false, reason: 'RAKUTEN_APP_ID未設定', items: [] };
  }

  // キーワードの決定
  let searchKeyword = keyword;

  // 楽天URLが直接渡されていればそちらを優先
  const rakutenUrlInput = rakutenUrl || urls.rakuten || '';
  if (!searchKeyword && rakutenUrlInput) {
    const itemCode = extractItemCodeFromUrl(rakutenUrlInput);
    if (itemCode) {
      searchKeyword = itemCode.replace(/[-_]/g, ' ');
    }
  }

  // URLから推定（最終手段）
  if (!searchKeyword) {
    for (const url of Object.values(urls).filter(Boolean)) {
      const inferred = inferKeywordFromUrl(url);
      if (inferred) { searchKeyword = inferred; break; }
    }
  }

  if (!searchKeyword) {
    return { ok: false, reason: 'キーワードを特定できませんでした', items: [] };
  }

  const params = new URLSearchParams({
    applicationId: appId,
    keyword: searchKeyword,
    hits: String(hits),
    sort: '-reviewCount',
    format: 'json',
  });
  if (affiliateId) params.set('affiliateId', affiliateId);

  const apiUrl = `${RAKUTEN_API_BASE}?${params.toString()}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: `APIエラー ${res.status}: ${text.slice(0, 100)}`, items: [] };
    }
    const json = await res.json();

    if (json.error) {
      return { ok: false, reason: `楽天APIエラー: ${json.error_description || json.error}`, items: [] };
    }

    const items = (json.Items || []).map(({ Item: it }) => ({
      name: it.itemName,
      price: it.itemPrice,
      reviewCount: it.reviewCount,
      reviewAverage: it.reviewAverage,
      imageUrl: it.mediumImageUrls?.[0]?.imageUrl || it.smallImageUrls?.[0]?.imageUrl || null,
      rakutenUrl: it.affiliateUrl || it.itemUrl,
      shopName: it.shopName,
      catchCopy: it.catchcopy || '',
      itemCode: it.itemCode,
    }));

    return {
      ok: true,
      keyword: searchKeyword,
      totalCount: json.count,
      items,
      // 先頭1件を「ベスト候補」として返す
      best: items[0] || null,
    };
  } catch (err) {
    return { ok: false, reason: `ネットワークエラー: ${err.message}`, items: [] };
  }
}
