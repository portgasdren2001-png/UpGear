/**
 * scoring.js — UpGear商品理解スコア計算
 *
 * UpGear思想: ギア = 判断を減らすための装備
 * スコアは「UpGear判断として使えるか」の信頼度
 */

export function calcUnderstandingScore(card) {
  let score = 0;
  const missing = [];

  // ─── 基本情報（商品として識別できるか）
  if (card.name && card.name !== '不明')          { score += 10; } else { missing.push('商品名'); }
  if (card.brand && card.brand !== '不明')         { score += 5;  } else { missing.push('ブランド'); }
  if (card.category)                              { score += 10; } else { missing.push('カテゴリ'); }
  if (card.priceRange && card.priceRange !== '—') { score += 5;  } else { missing.push('価格帯'); }

  // ─── UpGear判断の核心（判断削減の根拠があるか）
  if (card.judgmentReducer)                       { score += 15; } else { missing.push('何の判断を減らすか（重要）'); }
  if ((card.notForWho || []).length >= 2)         { score += 10; } else { missing.push('向いていない人（2つ以上）'); }
  if (card.forWho)                                { score += 8;  } else { missing.push('向いている人'); }
  if ((card.dailyFrictionReduced || []).length >= 1) { score += 8; } else { missing.push('日常で減る迷い'); }
  if (card.continuityReason)                      { score += 8;  } else { missing.push('継続使用できる理由'); }

  // ─── 比較・弱点（公平な判断材料があるか）
  if (card.vsAlternatives)                        { score += 6;  } else { missing.push('代替品との比較'); }
  if ((card.weaknesses || []).length >= 1)        { score += 5;  } else { missing.push('弱点'); }

  // ─── TikTok活用可能性
  if ((card.tiktokAngles || []).length >= 1)      { score += 5;  } else { missing.push('TikTok切り口'); }

  // ─── データ品質ボーナス
  if (card.dataQuality === 'excellent')           { score += 5; }
  else if (card.dataQuality === 'good')           { score += 3; }

  return { score: Math.min(100, score), missing };
}
