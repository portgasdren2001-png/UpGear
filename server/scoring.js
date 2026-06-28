/**
 * scoring.js — 商品理解スコア計算
 * フロントエンドの calcUnderstandingScore と同じロジック
 */

export function calcUnderstandingScore(card) {
  let score = 0;
  const missing = [];

  if (card.name && card.name !== '不明')             score += 12; else missing.push('商品名');
  if (card.brand && card.brand !== '不明')            score += 8;  else missing.push('ブランド');
  if (card.category)                                 score += 15; else missing.push('カテゴリ（最重要）');
  if (card.subCategory)                              score += 8;  else missing.push('サブカテゴリ');
  if (card.priceRange && card.priceRange !== '—')    score += 5;  else missing.push('価格');
  if (card.whatIsThis)                               score += 10; else missing.push('商品説明');
  if ((card.strengths || []).length >= 2)            score += 8;  else missing.push('強み（2つ以上）');
  if ((card.weaknesses || []).length >= 2)           score += 8;  else missing.push('弱み（2つ以上）');
  if ((card.reviewData?.positive || []).length >= 2) score += 8;  else missing.push('ポジティブ評価');
  if ((card.searchKeywords || []).length >= 5)       score += 8;  else missing.push('検索キーワード（5つ以上）');
  if ((card.urlCount || 0) >= 2)                     score += 10;
  else if ((card.urlCount || 0) === 1)               { score += 4; missing.push('複数URL（2つ以上推奨）'); }

  return { score: Math.min(100, score), missing };
}
