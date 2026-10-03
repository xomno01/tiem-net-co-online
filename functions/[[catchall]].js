// Cloudflare Pages Functions - Full-Stack Mock Backend
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-dev-shop, x-dev-day',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. POST /auth/v1/signup
  if (path === '/auth/v1/signup' && request.method === 'POST') {
    const userId = 'cf_guest_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 * 30 })) +
      '.signature';

    return new Response(JSON.stringify({
      access_token: fakeToken,
      refresh_token: 'refresh_' + userId,
      token_type: 'bearer',
      expires_in: 86400 * 30,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
      user: { id: userId, account_kind: 'guest' }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 2. GET /api/bootstrap
  if (path === '/api/bootstrap') {
    return new Response(JSON.stringify({
      cloud: null,
      profile: { shop_name: '', account_kind: 'guest' },
      userId: 'guest_user'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 3. POST /api/reset (Tạo game mới với schema đầy đủ)
  if (path === '/api/reset' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch(e) {}
    const save = {"v":1,"shopName":"NET N0AI","serviceSign":{"line1":"","line2":""},"autoDebtUntil":0,"playerName":"","playerGender":"m","playerLook":{"skin":"#e8b890","hair":"#1f1a1a","style":"messy","shirt":"#f4f4f4","pants":"#3a6bc9","shoes":"#6b4a2a","acc":"","gender":"m"},"money":500000,"day":1,"time":420,"fame":0,"reviews":[3,3,3,3,3],"rating":3,"stage":0,"esports":{"v":1,"rng":14731,"nextId":1,"rating":1200,"fans":0,"team":[null,null,null,null,null],"players":{},"scouts":{},"trainDay":0,"inviteDay":0,"matchDay":0,"boostUntil":0,"history":[],"series":null},"progression":{"xpTotal":0,"level":1,"dayPaid":0,"rewardKeys":[]},"hr":{"rng":17855032,"freeFlyers":1,"trainingPoints":0,"shards":0,"channels":{"flyer":{"noA":0,"noS":0,"draws":0},"facebook":{"noA":0,"noS":0,"draws":0},"ads":{"noA":0,"noS":0,"draws":0}},"lastResult":null,"log":[],"incidents":[]},"live":{"v":1,"unlocks":{"done":[],"auto":[],"extra":[],"at":{},"pending":[]},"npcs":{},"chains":{},"evt":{"last":{},"n":{},"microT":30},"biz":{"priceMult":1,"late":false,"happy":false,"memberPromo":false,"flyerDay":0,"fbUntil":0,"supply":1,"supplyDay":0,"supplyEvent":1,"supplyEventDay":0,"buzz":0,"sponsorUntil":0,"referrals":[]},"rival":{"state":"none","since":0},"tour":{"state":"none","day":0,"startT":0,"pen":0,"count":0},"goals":{"daily":[],"dailyDay":0,"ch":{},"npc":[]},"world":{"pcDay":-9,"beautyDay":-9,"beautyRef":-1,"priceDay":-9,"priceDir":0,"upDay":-9},"stats":{"extends":0,"selfRepairs":0,"debtsCollected":0,"tournaments":0,"lateNights":0,"fullHouse":0,"maxLagComplaints":0,"regularVisits":0,"bestDayCustomers":0,"bestDayRevenue":0,"bestNightCustomers":0,"goodDayStreak":0,"noBreakDays":0,"fastOpens":0,"topups":0,"maxRel":0,"referrals":0},"today":{},"sold":{},"log":[],"guide":{"seen":{},"n":{},"done":{},"off":false},"community":{"shown":0,"joined":false}},"kitchen":{"inventory":{"mi-goi":3,"trung-ga":3,"xuc-xich":3},"discovered":{},"prepared":{},"menu":[],"pins":[],"shards":0,"shardsEarned":0,"sssClaims":{},"giftedSSS":{},"boxOpens":0,"boxPity":0,"boxLegendPity":0,"marketVersion":2,"marketDay":0,"marketRevision":0,"marketResetAt":0,"boxResetAt":0,"boxPurchases":0,"market":[],"huntDay":0,"hunts":0,"rng":2463534242,"sales":0},"blackMarket":{"version":1,"unlocked":false,"introSeen":false,"seed":538340669,"rng":1,"stallSlots":5,"marketDay":0,"acc":0,"nextId":1,"offers":[],"listings":[],"pending":[],"bargainBuys":[],"stock":{"parts":[],"cards":{}},"cardsIssued":{},"watch":[],"ops":{},"opOrder":[],"stats":{"bought":0,"spent":0,"sold":0,"gross":0,"fees":0,"collected":0},"today":{"day":0,"bought":0,"fees":0,"revenue":0}},"bag":{"v":1,"seed":539029192,"items":{},"opened":{},"day":0,"got":{"lixi":0},"bought":{},"equip":{"frame":null,"bubble":null,"title":null},"seen":{},"log":[],"stats":{"lixiOpened":0,"chestsOpened":0,"ticketsUsed":0,"scratched":0,"scratchWon":0,"jackpots":0,"bigWins":0,"giftsPlaced":0,"giftsSent":0,"giftsGot":0},"ledger":{"money":0},"gifts":{"sent":[],"recv":{}}},"gigs":{"v":1,"boardSeed":269856288,"cooldowns":{},"seen":{},"scrap":{"kg":0},"cards":{"sold":0,"profit":0},"odd":{"day":0,"jobs":[]},"night":{"day":0,"income":0,"pcs":0,"wear":0},"stream":{"day":0,"score":0,"donate":0},"total":{"money":0},"today":{"day":0,"scrap":0,"cards":0,"odd":0,"night":0,"stream":0}},"expansion":0,"floorFinishes":{"rooms":{}},"floors":{"built":1,"building":null,"active":0,"rooms":[]},"upgrades":{"counter":0,"floor":0,"wall":0,"light":0,"cooling":0,"internet":0,"router":0,"power":0,"kitchen":0,"shoes":0},"pcs":[],"storedPcs":[],"decor":[],"trash":[],"stash":{},"customers":[],"workers":[],"staff":[],"payQueue":[],"waitQueue":[],"stock":{},"autoRestock":true,"members":[],"debts":[],"finance":{"version":1,"nextId":1,"loan":null,"history":[],"seizedPcs":0,"bankrupt":false,"bankruptcyReason":"","bankruptcyDay":0},"events":[],"buffs":[],"stats":{"served":0,"pcsOpened":0,"drinksSold":0,"foodSold":0,"totalEarned":0,"cleaned":0,"trashPicked":0,"repaired":0,"longestSession":0,"fiveStars":0,"debtsGiven":0,"angry":0,"runaways":0},"today":{"rev":{"pc":0,"game":0,"food":0,"drink":0,"topup":0,"debt":0,"tip":0},"cost":{"elec":0,"net":0,"ingredients":0,"repair":0,"salary":0,"staffMistakes":0,"loan":0,"tax":0},"cash":{"opening":null,"received":0,"paid":0,"rewards":0,"sales":0},"prepaidUsed":{"pc":0,"food":0,"drink":0},"paidElec":0,"hrPayroll":{},"xpActions":{"clean":0,"repair":0,"serve":0},"reviewLog":[],"invest":0,"stockBuy":0,"customers":0,"lost":0,"reviews":[],"fame":0,"finance":{"borrowed":0,"paid":0,"interest":0,"seized":0}},"history":[],"quest":{"idx":0,"ready":false},"achievements":{},"tutorial":{"step":0,"done":false},"nextId":1,"pcCounter":0,"powerOff":0,"powerOffReason":"","phase":"open","lastReport":null,"clockFrozen":false};
    save.shopName = body.shopName || 'CYBER NET N0AI PRO';

    return new Response(JSON.stringify({
      save: save,
      revision: 1,
      receipt: crypto.randomUUID().replace(/-/g, ''),
      syncedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 4. POST /api/sync
  if (path === '/api/sync' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch(e) {}
    return new Response(JSON.stringify({
      revision: (body.revision || 0) + 1,
      receipt: crypto.randomUUID().replace(/-/g, ''),
      syncedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 5. GET /api/leaderboard
  if (path === '/api/leaderboard') {
    return new Response(JSON.stringify({
      type: 'revenue',
      rows: [
        { rank: 1, shopName: 'CYBER NET N0AI PRO', day: 15, score: 88000000 },
        { rank: 2, shopName: 'Net Co Thu Duc', day: 10, score: 45000000 },
        { rank: 3, shopName: 'Net Anh Em 24/7', day: 8, score: 25000000 }
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 6. GET /api/notices
  if (path === '/api/notices') {
    return new Response(JSON.stringify({
      rows: [
        { id: 1, title: 'Server Cloudflare Pages Online!', body: 'Chào mừng bạn đến với Tiệm Nét Cỏ Online v1.2.3!', kind: 'info' }
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 7. POST /api/operations
  if (path === '/api/operations') {
    return new Response(JSON.stringify({
      heartbeatMs: 300000,
      announcements: []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 8. /api/social/*
  if (path.startsWith('/api/social/')) {
    return new Response(JSON.stringify({
      messages: [
        { id: '1', shopName: 'CYBER NET N0AI PRO', day: 1, content: 'Chào mừng anh em ghé chơi quán nét!', createdAt: new Date().toISOString() }
      ],
      ok: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  return env.ASSETS.fetch(request);
}
