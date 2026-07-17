const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

const db = admin.firestore();
const EVENTS_COL = 'kpi_events';
const STUDENTS_COL = 'kpi_students';
const SUBJECTS_COL = 'kpi_subjects';
const ACHIEVEMENTS_COL = 'kpi_achievements';

function getStartOfWeek(date) {
  let d = new Date(date);
  let day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function getStartOfMonth(date) {
  let d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDefaultQuestProgress() {
  var today = new Date();
  var weekStart = getStartOfWeek(today);
  return {
    daily: { resetKey: today.toDateString(), progress: {}, claimed: {} },
    weekly: { resetKey: weekStart.toDateString(), progress: {}, claimed: {} }
  };
}

function computeQuestProgress(events) {
  if (!events || events.length === 0) return getDefaultQuestProgress();
  var qp = getDefaultQuestProgress();
  var now = new Date();
  var todayStr = now.toDateString();
  var weekStart = getStartOfWeek(now).getTime();

  for (var i = 0; i < events.length; i++) {
    var evt = events[i];
    var rowDate = evt.timestamp instanceof Timestamp
      ? evt.timestamp.toDate()
      : new Date(evt.timestamp);
    var action = String(evt.action || "");
    var safeNote = String(evt.note || "");

    if (rowDate.toDateString() === todayStr) {
      if (action !== "系統測試") qp.daily.progress["LOGIN"] = (qp.daily.progress["LOGIN"] || 0) + 1;
      if (action === "每日提交") qp.daily.progress["DAILY_SUBMIT"] = (qp.daily.progress["DAILY_SUBMIT"] || 0) + 1;
      if (action === "戰鬥勝利" && (safeNote.indexOf("路人") !== -1 || safeNote.indexOf("[Daily]") !== -1 || safeNote.indexOf("Raid") !== -1)) {
        qp.daily.progress["BATTLE_3"] = (qp.daily.progress["BATTLE_3"] || 0) + 1;
      }
      if (action === "捕捉" || action === "A") qp.daily.progress["CAPTURE_1"] = (qp.daily.progress["CAPTURE_1"] || 0) + 1;
    }

    if (rowDate.getTime() >= weekStart) {
      if (action === "戰鬥勝利" && (safeNote.indexOf("[Gym]") !== -1 || safeNote.indexOf("道館") !== -1)) {
        qp.weekly.progress["GYM_3"] = (qp.weekly.progress["GYM_3"] || 0) + 1;
      }
      if (action === "捕捉" || action === "A") qp.weekly.progress["CAPTURE_5"] = (qp.weekly.progress["CAPTURE_5"] || 0) + 1;
      if (action === "戰鬥勝利") qp.weekly.progress["BATTLE_10"] = (qp.weekly.progress["BATTLE_10"] || 0) + 1;
      if (action === "PvP") qp.weekly.progress["PVP_2"] = (qp.weekly.progress["PVP_2"] || 0) + 1;
    }
  }
  return qp;
}

function getExpNeeded(lvl) {
  if (lvl <= 10) return lvl * 30;
  if (lvl <= 20) return lvl * 60;
  if (lvl <= 35) return lvl * 100;
  if (lvl <= 55) return lvl * 180;
  if (lvl <= 75) return lvl * 300;
  if (lvl <= 85) return lvl * 500;
  if (lvl <= 92) return lvl * 1000;
  if (lvl <= 105) return lvl * 2000;
  return lvl * 3000;
}
function calcLevelAndExp(totalExp, initialLevel) {
  let lvl = initialLevel || 5;
  let currentExp = totalExp;
  let expNeeded = getExpNeeded(lvl);
  while (currentExp >= expNeeded) {
    currentExp -= expNeeded;
    lvl++;
    expNeeded = getExpNeeded(lvl);
    if (lvl >= 120) { lvl = 120; currentExp = 0; expNeeded = 0; break; }
  }
  if (lvl >= 120) { lvl = 120; currentExp = 0; expNeeded = 0; }
  return { level: lvl, expProgress: currentExp, expNeeded };
}

async function getStudentEvents(studentId) {
  const snapshot = await db.collection(EVENTS_COL)
    .where('studentId', '==', studentId)
    .orderBy('timestamp', 'asc')
    .get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Reverse evolution map: evolved form → base form
// Auto-generated from POKEMON_TIERS (Gen1-9)
const EVO_REVERSE_MAP = {
  "七夕青鳥":"青綿鳥","三合一磁怪":"小磁怪","三地鼠":"地鼠","三首惡龍":"單首龍","九尾":"六尾","人造細胞卵":"單卵細胞球","仆斬將軍":"駒刀小兵",  "仙子精靈":"伊布","仙子伊布":"伊布","雷精靈":"伊布","水精靈":"伊布","火精靈":"伊布","太陽精靈":"伊布","月亮精靈":"伊布","葉精靈":"伊布","冰精靈":"伊布","以歐路普":"索偵蟲","伽勒爾呆呆王":"伽勒爾呆呆獸","伽勒爾呆殼獸":"伽勒爾呆呆獸","伽勒爾直衝熊":"伽勒爾蛇紋熊","伽勒爾達摩狒狒":"伽勒爾火紅不倒翁","佛烈托斯":"榛果球","修建老匠":"搬運小匠","倫琴貓":"小貓怪","優雅貓":"向尾喵","八爪武師":"拳拳蛸","具甲武者":"弱小蟲","冰伊布":"伊布","冰鬼護":"雪童子","冷水猿":"冷水猴","刺甲貝":"大舌貝","刺龍王":"海刺龍","劈斬司令":"駒刀小兵","力壯雞":"火稚雞","勇基拉":"凱西","勒克貓":"小貓怪","千面避役":"淚眼蜥","卡咪龜":"傑尼龜","卡比獸":"小卡比獸","叉字蝠":"大嘴蝠","口呆花":"喇叭芽","可多拉":"可可多拉","吉利蛋":"小福蛋","君主蛇":"藤藤蛇","吞食獸":"溶食獸","呆呆王":"呆呆魚","呆殼獸":"呆呆獸","呱頭蛙":"呱呱泡蛙","哈克龍":"迷你龍","哈約克":"小約克","哥德小姐":"哥德寶寶","哥德小童":"哥德寶寶","哥達鴨":"可達鴨","啪咚猴":"敲音猴","喇叭啄鳥":"小篤兒","喵頭目":"伽勒爾喵喵","嘎啦嘎啦":"卡拉卡拉","嘟嘟利":"嘟嘟","噗噗豬":"跳跳豬","噬沙堡爺":"沙丘娃","噴火駝":"呆火駝","噴火龍":"小火龍","四顎針龍":"毒貝比","圈圈熊":"熊寶寶","土台龜":"草苗龜","地幔岩":"石丸子","堅果啞鈴":"種子鐵球","堅盾劍怪":"獨劍鞘","堵攔熊":"伽勒爾蛇紋熊","多刺菊石獸":"菊石獸","多邊獸Ⅱ":"多邊獸","多邊獸Ｚ":"多邊獸","多龍奇":"多龍梅西亞","多龍巴魯托":"多龍梅西亞","夢妖魔":"夢妖","大劍鬼":"水水獺","大力鱷":"小鋸鱷","大嘴蝠":"超音蝠","大嘴雀":"烈雀","大尾立":"尾立","大比鳥":"波波","大狼犬":"土狼犬","大舌舔":"大舌頭","大菊花":"菊草葉","大針蜂":"獨角蟲","大鋼蛇":"大岩蛇","大電海燕":"電海燕","大食花":"喇叭芽","天然鳥":"天然雀","天罩蟲":"索偵蟲","太古盔甲":"太古羽蟲","太陽伊布":"伊布","奇魯莉安":"拉魯拉絲","奧利瓦":"迷你芙","奧利紐":"迷你芙","好勝毛蟹":"好勝蟹","妖火紅狐":"火狐狸","妙蛙花":"妙蛙種子","妙蛙草":"妙蛙種子","姆克鳥":"姆克兒","姆克鷹":"姆克兒","始祖大鳥":"始祖小鳥","安瓢蟲":"芭瓢蟲","寶石海星":"海星星","尖牙陸鯊":"圓陸鯊","尼多力諾":"尼多朗","尼多后":"尼多蘭","尼多娜":"尼多蘭","尼多王":"尼多朗","巧鍛匠":"小鍛匠","巨沼怪":"水躍魚","巨牙鯊":"利牙魚","巨蔓藤":"蔓藤怪","巨金怪":"鐵啞鈴","巨鉗螳螂":"飛天螳螂","巨鉗蟹":"大鉗蟹","巨鍛匠":"小鍛匠","巴大蝶":"綠毛蟲","巴布土撥":"布撥","布土撥":"布撥","布里卡隆":"哈力栗","布魯皇":"布魯","帝牙海獅":"海豹球","帝王拿波":"波加曼","師父鼬":"功夫鼬","幸福蛋":"小福蛋","彷徨夜靈":"夜巡靈","心蝙蝠":"滾滾蝙蝠","快龍":"迷你龍","念力土偶":"天秤偶","怪力":"腕力","恰雷姆":"瑪沙那","戰槌龍":"頭蓋龍","投羽梟":"木木梟","拉達":"小拉達","掘地兔":"掘掘兔","搖籃百合":"觸手百合","敏捷蟲":"小嘴蝸","斗笠菇":"蘑蘑菇","斧牙龍":"牙牙","暴噬龜":"咬咬龜","暴露菇":"寶貝球菇","暴飛龍":"寶貝龍","暴鯉龍":"鯉魚王","月亮伊布":"伊布","月桂葉":"菊草葉","末入蛾":"毛球","杖尾鱗甲龍":"心鱗寶","柯波朗":"巴爾郎","棄世猴":"火爆猴","森林蜥蜴":"木守宮","椰蛋樹":"蛋蛋","樂天河童":"蓮葉童子","樹才怪":"盆才怪","樹林龜":"草苗龜","櫻花魚":"珍珠貝","步哨鼠":"探探鼠","毒刺水母":"瑪瑙水母","毒拉蜜":"垃垃藻","毒粉蛾":"盾甲繭","毒薔薇":"含羞苞","比比鳥":"波波","水伊布":"伊布","水晶燈火靈":"燭光靈","水箭龜":"傑尼龜","沙基拉":"由基拉","沙基拉斯":"幼基拉斯","沙奈朵":"拉魯拉絲","沙漠蜻蜓":"大顎蟻","沙瓦郎":"巴爾郎","沙鐵皮":"團珠蛇","沼王":"烏波","沼躍魚":"水躍魚","波克基古":"波克比","波克基斯":"波克比","波士可多拉":"可可多拉","波波鴿":"豆豆鴿","波皇子":"波加曼","洗翠冰岩怪":"冰岩怪","洗翠索羅亞克":"洗翠索羅亞","洗翠頑皮雷彈":"洗翠霹靂電球","洗翠風速狗":"洗翠卡蒂狗","派拉斯特":"派拉斯","流氓鱷":"黑眼鱷","浮潛鼬":"泳圈鼬","海兔獸":"無殼海兔","海刺龍":"墨海馬","海魔獅":"海豹球","混混鱷":"黑眼鱷","湧躍鴨":"潤水鴨","滴蛛霸":"滴蛛","火伊布":"伊布","火岩鼠":"火球鼠","火恐龍":"小火龍","火焰雞":"火稚雞","火爆猴":"猴怪","火爆獸":"火球鼠","火神蛾":"燃燒蟲","火箭雀":"小箭雀","炎武王":"暖暖豬","炎熱喵":"火斑喵","炒炒豬":"暖暖豬","炙燙鱷":"呆火鱷","烈咬陸鯊":"圓陸鯊","烈焰猴":"小火焰猴","烈焰馬":"小火馬","烈箭鷹":"小箭雀","烈腿蝗":"豆蟋蟀","烏賊王":"好啦魷","烏鴉頭頭":"黑暗鴉","焰后蜥":"夜盜火蜥","熾焰咆哮虎":"火斑喵","燈火幽靈":"燭光靈","燈罩夜菇":"睡睡菇","爆音怪":"吼爆彈","爆香猿":"爆香猴","狂歡浪舞鴨":"潤水鴨","狐大盜":"偷兒狐","狙射樹梟":"木木梟","狡猾天狗":"橡實果","狩獵鳳蝶":"刺尾蟲","猛火猴":"小火焰猴","獵斑魚":"珍珠貝","班基拉斯":"由基拉","瑪狃拉":"狃拉","甲殼蛹":"刺尾蟲","甲殼龍":"寶貝龍","甲賀忍蛙":"呱呱泡蛙","白海獅":"小海獅","皮可西":"皮皮","直衝熊":"蛇紋熊","穿山王":"穿山鼠","穿著熊":"童偶熊","章魚桶":"鐵炮魚","素利拍":"素利普","索羅亞克":"索羅亞","羅絲雷朵":"含羞苞","美納斯":"醜醜魚","美麗花":"臭臭花","耿鬼":"鬼斯","肋骨海龜":"原蓋海龜","胖可丁":"胖丁","胖胖哈力":"哈力栗","胡地":"凱西","自爆磁怪":"三合一磁怪","臭臭泥":"臭泥","臭臭花":"走路草","艾比郎":"巴爾郎","艾路雷朵":"拉魯拉絲","花椰猿":"花椰猴","花漾海獅":"球海獅","茸茸羊":"咩利羊","葉伊布":"伊布","蒂蕾喵":"新葉喵","蓮帽小童":"蓮葉童子","蔥遊兵":"伽勒爾大蔥鴨","藍蟾蜍":"圓蝌蚪","藍鱷":"小鋸鱷","藍鴉":"稚山雀","藏飽栗鼠":"貪心栗鼠","蘋裹龍":"啃果蟲","蘭螳花":"偽螳草","蚊香君":"蚊香蝌蚪","蚊香泳士":"蚊香蝌蚪","蜈蚣王":"百足蜈蚣","蜥蜴王":"木守宮","蝶結萌虻":"萌虻","蟾蜍王":"圓蝌蚪","西獅海壬":"球海獅","詛咒娃娃":"怨影娃娃","請假王":"懶人獺","護城龍":"盾甲龍","變澀蜥":"淚眼蜥","豐蜜龍":"啃果蟲","象牙豬":"小山豬","豪力":"腕力","貓老大":"喵喵","貓頭夜鷹":"咕咕","超壞星":"好壞星","超能妙喵":"妙喵","超鐵暴龍":"鑽角犀獸","超音波幼蟲":"大顎蟻","路卡利歐":"利歐路","車輪毬":"百足蜈蚣","轟擂金剛猩":"敲音猴","逐電犬":"來電汪","過動猿":"懶人獺","達摩狒狒":"火紅不倒翁","酷豹":"扒手貓","金屬怪":"鐵啞鈴","金魚王":"角金魚","銃嘴大鳥":"小篤兒","鋼炮臂蝦":"鐵臂槍蝦","鋼鎧鴉":"稚山雀","鍬農炮蟲":"蟲電寶","鐳射盔":"化石盔","鐵掌力士":"幕下力士","鐵殼蛹":"獨角蟲","鐵甲蛹":"綠毛蟲","鐵螯龍蝦":"龍蝦小兵","鐵骨土人":"搬運小匠","鑽角犀獸":"獨角犀牛","長尾火狐":"火狐狸","長毛巨魔":"提布莉姆","長毛狗":"小約克","長毛豬":"小山豬","長鼻葉":"橡實果","閃焰王牌":"炎兔兒","阿利多斯":"線球","阿柏怪":"阿柏蛇","阿羅拉三地鼠":"阿羅拉地鼠","阿羅拉九尾":"阿羅拉六尾","阿羅拉拉達":"阿羅拉小拉達","阿羅拉穿山王":"阿羅拉穿山鼠","阿羅拉臭臭泥":"阿羅拉臭泥","阿羅拉貓老大":"阿羅拉喵喵","隆隆岩":"小拳石","隆隆石":"小拳石","雙刃丸":"水水獺","雙劍鞘":"獨劍鞘","雙卵細胞球":"單卵細胞球","雙彈瓦斯":"瓦斯彈","雙斧戰龍":"牙牙","雙首暴龍":"單首龍","雪妖女":"雪童子","雪絨蛾":"雪吞蟲","雷丘":"皮卡丘","雷伊布":"伊布","電擊獸":"電擊怪","電擊魔獸":"電擊怪","電肚蛙":"光蚪仔","電蜘蛛":"電電蟲","電龍":"咩利羊","霓虹魚":"螢光魚","霜奶仙":"小仙奶","霸王花":"走路草","青藤蛇":"藤藤蛇","青銅鐘":"銅鏡怪","音波龍":"嗡蝠","頑皮雷彈":"霹靂電球","頓甲":"小小象","顫弦蠑螈":"毒電嬰","風速狗":"卡蒂狗","騎士蝸牛":"蓋蓋蟲","騰蹴小將":"炎兔兒","骨紋巨聲鱷":"呆火鱷","高傲雉雞":"豆豆鴿","鬃岩狼人":"岩狗狗","鬼斯通":"鬼斯","魔幻假面喵":"新葉喵","魔牆人偶":"魔尼尼","鯰魚王":"泥泥鰍","鱗甲龍":"心鱗寶","鴨嘴火獸":"小鴨嘴火龍","鴨嘴炎獸":"小鴨嘴火龍","麻麻鰻":"麻麻小魚","麻麻鰻魚王":"麻麻小魚","黏美兒":"黏黏寶","黏美龍":"黏黏寶","黑夜魔靈":"夜巡靈","黑魯加":"戴魯比","龍王蠍":"紫天蝎","龍頭地鼠":"螺釘地鼠","龐岩怪":"石丸子",
};
function _getRawName(n) {
  var s = n.replace(/^[⭐✨]\s*/, '').replace(/\s*\([^)]*\).*$/, '').trim();
  return s || null;
}
// Forward evolution chain map for multi-stage downgrade
// baseName → [stage1, stage2, ...] (in evolution order)
const EVO_CHAIN_MAP = {
  "小福蛋":["吉利蛋","幸福蛋"],"水水獺":["雙刃丸","大劍鬼"],"木木梟":["投羽梟","狙射樹梟"],
  "淚眼蜥":["變澀蜥","千面避役"],"黏黏寶":["黏美兒","黏美龍"],
  "喇叭芽":["口呆花","大食花"],"獨角蟲":["鐵殼蛹","大針蜂"],"綠毛蟲":["鐵甲蛹","巴大蝶"],
  "波波":["比比鳥","大比鳥"],"小拉達":["拉達"],"穿山鼠":["穿山王"],"超音蝠":["大嘴蝠","叉字蝠"],
  "走路草":["臭臭花","霸王花"],"派拉斯":["派拉斯特"],"毛球":["末入蛾"],"地鼠":["三地鼠"],
  "猴怪":["火爆猴","棄世猴"],"卡蒂狗":["風速狗"],"蚊香蝌蚪":["蚊香君","蚊香泳士"],
  "凱西":["勇基拉","胡地"],"腕力":["豪力","怪力"],"小火馬":["烈焰馬"],"大蔥鴨":["蔥遊兵"],
  "小海獅":["白海獅"],"臭泥":["臭臭泥"],"大舌貝":["刺甲貝"],"鬼斯":["鬼斯通","耿鬼"],
  "獨角犀牛":["鑽角犀獸","超鐵暴龍"],"吉利蛋":["幸福蛋"],"蔓藤怪":["巨蔓藤"],
  "喵喵":["貓老大"],"霹靂電球":["頑皮雷彈"],"卡拉卡拉":["嘎啦嘎啦"],"蛋蛋":["椰蛋樹"],
  "瓦斯彈":["雙彈瓦斯"],"墨海馬":["海刺龍","刺龍王"],"角金魚":["金魚王"],"海星星":["寶石海星"],
  "素利普":["素利拍"],"大鉗蟹":["巨鉗蟹"],"小拳石":["隆隆石","隆隆岩"],
  "臭臭花":["美麗花"],"鴨嘴火獸":["鴨嘴炎獸"],"電擊獸":["電擊魔獸"],"大岩蛇":["大鋼蛇"],
  "飛天螳螂":["巨鉗螳螂"],"菊石獸":["多刺菊石獸"],"化石盔":["鐳射盔"],
  "火紅不倒翁":["達摩狒狒"],"搬運小匠":["鐵骨土人","修建老匠"],"螺釘地鼠":["龍頭地鼠"],
  "差不多娃娃":["超能妙喵"],"石丸子":["地幔岩","龐岩怪"],"蓋蓋蟲":["騎士蝸牛"],
  "小嘴蝸":["敏捷蟲"],"種子鐵球":["堅果啞鈴"],"麻麻小魚":["麻麻鰻","麻麻鰻魚王"],
  "小約克":["哈約克","長毛狗"],"探探鼠":["步哨鼠"],"豆豆鴿":["波波鴿","高傲雉雞"],
  "索偵蟲":["天罩蟲","以歐路普"],"獨劍鞘":["雙劍鞘","堅盾劍怪"],"小鍛匠":["巧鍛匠","巨鍛匠"],
  "炭小侍":["紅蓮鎧騎"],"電海燕":["大電海燕"],
  // Gen1 starters
  "小火龍":["火恐龍","噴火龍"],"妙蛙種子":["妙蛙草","妙蛙花"],"傑尼龜":["卡咪龜","水箭龜"],
  // Gen1 rare chain
  "迷你龍":["哈克龍","快龍"],"由基拉":["沙基拉","班基拉斯"],"寶貝龍":["甲殼龍","暴飛龍"],
  "鐵啞鈴":["金屬怪","巨金怪"],"拉魯拉絲":["奇魯莉安","沙奈朵","艾路雷朵"],
  "圓陸鯊":["尖牙陸鯊","烈咬陸鯊"],"心鱗寶":["鱗甲龍","杖尾鱗甲龍"],
  // Gen3 starters
  "火稚雞":["力壯雞","火焰雞"],"木守宮":["森林蜥蜴","蜥蜴王"],"水躍魚":["沼躍魚","巨沼怪"],
  // Gen2 starters
  "菊草葉":["月桂葉","大菊花"],"火球鼠":["火岩鼠","火爆獸"],"小鋸鱷":["藍鱷","大力鱷"],
  // Gen5 starters
  "藤藤蛇":["青藤蛇","君主蛇"],"暖暖豬":["炒炒豬","炎武王"],
  // Gen7 starters
  "球海獅":["花漾海獅","西獅海壬"],"火斑喵":["炎熱喵","熾焰咆哮虎"],
  // Gen8 starters
  "敲音猴":["啪咚猴","轟擂金剛猩"],"炎兔兒":["騰蹴小將","閃焰王牌"],
  // Gen9 starters
  "呆火鱷":["炙燙鱷","骨紋巨聲鱷"],"新葉喵":["蒂蕾喵","魔幻假面喵"],"潤水鴨":["湧躍鴨","狂歡浪舞鴨"],
  // Gen4 starters
  "小火焰猴":["猛火猴","烈焰猴"],"草苗龜":["樹林龜","土台龜"],"波加曼":["波皇子","帝王拿波"],
  // Gen4 common
  "姆克兒":["姆克鳥","姆克鷹"],"小貓怪":["勒克貓","倫琴貓"],
  // Gen1 evo items (multi-stage)
  "呆呆獸":["呆殼獸","呆呆王"],"小鴨嘴火龍":["鴨嘴火獸","鴨嘴炎獸"],"電擊怪":["電擊獸","電擊魔獸"],
  // Gen2 evo items
  "刺尾蟲":["甲殼蛹","狩獵鳳蝶"],"盾甲繭":["毒粉蛾"],
  // Gen2-4 item/trade/multi
  "大舌頭":["大舌舔"],"海刺龍":["刺龍王"],"三合一磁怪":["自爆磁怪"],"彷徨夜靈":["黑夜魔靈"],
  // Multi-stage Gen2
  "咩利羊":["茸茸羊","電龍"],"橡實果":["長鼻葉","狡猾天狗"],"蓮葉童子":["蓮帽小童","樂天河童"],
  "小山豬":["長毛豬","象牙豬"],"可可多拉":["可多拉","波士可多拉"],
  // Multi-stage Gen3
  "大顎蟻":["超音波幼蟲","沙漠蜻蜓"],"海豹球":["海魔獅","帝牙海獅"],"珍珠貝":["獵斑魚","櫻花魚"],
  "懶人獺":["過動猿","請假王"],"夜巡靈":["彷徨夜靈","黑夜魔靈"],"雪童子":["冰鬼護","雪妖女"],
  "含羞苞":["毒薔薇","羅絲雷朵"],"波克比":["波克基古","波克基斯"],
  // Multi-stage Gen5
  "百足蜈蚣":["車輪毬","蜈蚣王"],"圓蝌蚪":["藍蟾蜍","蟾蜍王"],"黑眼鱷":["混混鱷","流氓鱷"],
  "單首龍":["雙首暴龍","三首惡龍"],"牙牙":["斧牙龍","雙斧戰龍"],"哥德寶寶":["哥德小童","哥德小姐"],
  "單卵細胞球":["雙卵細胞球","人造細胞卵"],"多多冰":["雙倍多多冰"],
  // Multi-stage Gen6
  "呱呱泡蛙":["呱頭蛙","甲賀忍蛙"],"哈力栗":["胖胖哈力","布里卡隆"],"火狐狸":["長尾火狐","妖火紅狐"],
  // Multi-stage Gen7
  "小篤兒":["喇叭啄鳥","銃嘴大鳥"],"稚山雀":["藍鴉","鋼鎧鴉"],
  // Multi-stage Gen8
  "小箭雀":["火箭雀","烈箭鷹"],"布撥":["布土撥","巴布土撥"],"多龍梅西亞":["多龍奇","多龍巴魯托"],
  "蛇紋熊":["直衝熊","堵攔熊"],"伽勒爾蛇紋熊":["伽勒爾直衝熊","堵攔熊"],
  "伽勒爾呆呆獸":["伽勒爾呆殼獸","伽勒爾呆呆王"],
  // Multi-stage Gen9
  "迷你芙":["奧利紐","奧利瓦"],"燭光靈":["燈火幽靈","水晶燈火靈"],"啃果蟲":["蘋裹龍","豐蜜龍"],
  // Item-exclusive multi
  "駒刀小兵":["劈斬司令","仆斬將軍"],"小磁怪":["三合一磁怪","自爆磁怪"],
  "毒薔薇":["羅絲雷朵"],"鑽角犀獸":["超鐵暴龍"],
  // Trade evolution chains
  "勇基拉":["胡地"],"豪力":["怪力"],"隆隆石":["隆隆岩"],"鬼斯通":["耿鬼"],
  // Other multi-stage
  "多邊獸":["多邊獸Ⅱ","多邊獸Ｚ"],"幼基拉斯":["沙基拉斯","班基拉斯"]
};

// EVO_STAGE_OVERRIDES: split evolutions whose chain index ≠ actual stage
var EVO_STAGE_OVERRIDES = {
  "艾比郎":1,"柯波朗":1,        // 巴爾郎 split — both direct evo
  "呆呆王":1,                    // 呆呆獸 split — direct evo
  "櫻花魚":1,                    // 珍珠貝 split — direct evo
  "伽勒爾呆呆王":1,              // 伽勒爾呆呆獸 split
  "雪妖女":1,                    // 雪童子 split — direct evo
  "艾路雷朵":2,                  // 拉魯拉絲 chain — from 奇魯莉安
  "幸福蛋":2,                    // 3-stage chain — overwritten by 吉利蛋's entry
  "黑夜魔靈":2,                  // 3-stage chain — overwritten by 彷徨夜靈's entry
  "羅絲雷朵":2                   // 3-stage chain — overwritten by 毒薔薇's entry
};

function _fixEvoNameAfterCap(cleanName, initLv) {
  var rawName = _getRawName(cleanName);
  if (!rawName) return cleanName;
  var baseName = EVO_REVERSE_MAP[rawName];
  if (!baseName) return cleanName;
  var stage = Math.floor(initLv / 15);
  if (stage === 0) {
    var typeMatch = cleanName.match(/\(([^)]+)\)/);
    var typeStr = typeMatch ? typeMatch[1] : '一般';
    var prefix = cleanName.indexOf('✨') !== -1 ? '✨ ' : '⭐ ';
    return prefix + baseName + ' (' + typeStr + ')';
  }
  // For multi-stage chains, find the correct intermediate form
  var chain = EVO_CHAIN_MAP[baseName];
  if (chain && chain.length >= 2) {
    // Split evolution awareness: check if rawName is in the chain
    var rawIdx = chain.indexOf(rawName);
    if (rawIdx !== -1) {
      var requiredStage = EVO_STAGE_OVERRIDES[rawName] || (rawIdx + 1);
      if (stage >= requiredStage) return cleanName;
    }
    var idx = Math.min(stage - 1, chain.length - 1);
    var corrected = chain[idx];
    if (corrected && corrected !== rawName) {
      var typeMatch2 = cleanName.match(/\(([^)]+)\)/);
      var typeStr2 = typeMatch2 ? typeMatch2[1] : '一般';
      var prefix2 = cleanName.indexOf('✨') !== -1 ? '✨ ' : '⭐ ';
      return prefix2 + corrected + ' (' + typeStr2 + ')';
    }
  }
  return cleanName;
}

async function recalculateStudentState(studentId) {
  const events = await getStudentEvents(studentId);
  if (events.length === 0) return null;

  let state = {
    studentId,
    level: 5,
    totalExp: 0,
    coins: 0,
    badges: 0,
    lockedGymLevel: 5,
    highestLevel: 5,
    potions: 0, revives: 0, candies: 0,
    maxPotions: 0, maxRevives: 0,
    expSharePurchased: false,
    hasExpertBelt: false,
    hasEviolite: false, hasChampionCloak: false, hasAmuletCoin: false,
    hasQuickClaw: false, hasFocusLens: false, hasShellBell: false, hasLifeOrb: false, hasAssaultVest: false,
    電擊盒: false, 岩漿盒: false, '龍之鱗片': false, 護具: false, 金屬膜: false, '王者之證': false,
    todayCompleted: false,
    daysSinceLastBadge: 0,
    lastBadgeTime: null,
    firstLogTime: null,
    submitDates: {},
    todayBattles: 0,
    weekGymWins: 0,
    monthLeagueWins: 0,
    roster: { P0: { id: 'P0', baseName: '🐾 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' } },
    submitStreak: 0,
    oranBerries: 0, cheriBerries: 0, lumBerries: 0, chilanBerries: 0,
    hasFocusSash: false, hasEjectButton: false, hasRockyHelmet: false, hasWeaknessPolicy: false,
    tms: {},
    simpleMode: false,
    leagueRegionsWon: {},
    lastEventTimestamp: null,
    lastUpdated: Timestamp.now()
  };

  const dNow = new Date();
  const todayStr = dNow.toDateString();
  const startOfWeek = getStartOfWeek(dNow).getTime();
  const startOfMonth = getStartOfMonth(dNow).getTime();

  for (const evt of events) {
    const rowDate = evt.timestamp instanceof Timestamp
      ? evt.timestamp.toDate()
      : new Date(evt.timestamp);
    // Seed data type→action mapping for backward compatibility
    if (!evt.action && evt.type) {
      if (evt.type === 'badge') { evt.action = 'system'; evt.badgeChange = (evt.badgeChange || 0) + 1; }
      else if (evt.type === 'evolution') { evt.action = 'E'; evt.note = (evt.note||'')+'|獲得: '+evt.speciesTo+' ('+evt.flavor+'系)'; }
      else if (evt.type === 'capture') { evt.action = 'A'; evt.note = '捕獲: '+evt.species+' (一般系)|ID:'+evt.pokemonId; evt.score = evt.score || 80; }
      else if (evt.type === 'exp') { evt.action = 'B'; evt.expGained = evt.totalExpGained || 20000; evt.note = 'ID:'+evt.pokemonId; }
    }
    const { action, score, expGained, coinsGained, badgeChange, note, tasks } = evt;
    const rowExp = expGained || 0;
    const rowCoins = coinsGained || 0;
    const rowBadges = badgeChange || 0;
    const safeNote = String(note || '');
    const rowAction = String(action || '');
    const rowTasks = Array.isArray(tasks) ? tasks : [];

    if (!state.firstLogTime) state.firstLogTime = rowDate.getTime();
    state.badges += rowBadges;
    if (rowBadges > 0) state.lastBadgeTime = rowDate.getTime();
    state.coins += rowCoins;

    if (!['商城兌換', '戰鬥消耗', '物品消耗', 'E', '系統測試', 'trade', '道具裝備', 'system'].includes(rowAction)) {
      state.submitDates[rowDate.toDateString()] = true;
    }

    if (rowDate.toDateString() === todayStr &&
        !['商城兌換', '戰鬥消耗', '物品消耗', 'E', '戰鬥勝利', '系統測試', 'trade', 'A', 'B', '道具裝備', 'PvP', 'system'].includes(rowAction)) {
      state.todayCompleted = true;
    }

    // 親密度統計
    if (!state._happinessEvents) state._happinessEvents = {};
    if (rowAction === '每日提交' || rowAction === '捕捉' || rowAction === 'A') {
      for (const hid in state.roster) {
        if (!state._happinessEvents[hid]) state._happinessEvents[hid] = 0;
        state._happinessEvents[hid]++;
      }
    }
    if (rowAction === '戰鬥勝利') {
      const pMatch = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      if (pMatch) {
        const pIds = pMatch[1].split(',').map(s => s.trim());
        for (const pid of pIds) {
          if (pid && state.roster[pid]) {
            if (!state._happinessEvents[pid]) state._happinessEvents[pid] = 0;
            state._happinessEvents[pid] += 2;
          }
        }
      }
    }

    if (rowAction === '商城兌換') {
      if (safeNote.includes('好傷藥')) state.potions++;
      if (safeNote.includes('活力塊')) state.revives++;
      if (safeNote.includes('神奇糖果')) state.candies++;
      if (safeNote.includes('全滿藥')) state.maxPotions++;
      if (safeNote.includes('元氣藥塊')) state.maxRevives++;
      if (safeNote.includes('學習裝置')) state.expSharePurchased = true;
      if (safeNote.includes('進化奇石')) state.hasEviolite = true;
      if (safeNote.includes('達人帶')) state.hasExpertBelt = true;
      if (safeNote.includes('護符金幣')) state.hasAmuletCoin = true;
      if (safeNote.includes('冠軍披風')) state.hasChampionCloak = true;
      if (safeNote.includes('先制之爪')) state.hasQuickClaw = true;
      if (safeNote.includes('焦點鏡')) state.hasFocusLens = true;
      if (safeNote.includes('貝殼之鈴')) state.hasShellBell = true;
      if (safeNote.includes('生命寶珠')) state.hasLifeOrb = true;
      if (safeNote.includes('AV背心')) state.hasAssaultVest = true;
    if (safeNote.includes('電擊盒')) state.電擊盒 = true;
    if (safeNote.includes('岩漿盒')) state.岩漿盒 = true;
    if (safeNote.includes('龍之鱗片')) state['龍之鱗片'] = true;
    if (safeNote.includes('護具')) state.護具 = true;
    if (safeNote.includes('金屬膜')) state.金屬膜 = true;
    if (safeNote.includes('王者之證')) state['王者之證'] = true;
    if (safeNote.includes('橙橙果')) state.oranBerries++;
    if (safeNote.includes('奇異果')) state.cheriBerries++;
    if (safeNote.includes('木子果')) state.lumBerries++;
    if (safeNote.includes('抗性果')) state.chilanBerries++;
    if (safeNote.includes('氣勢披帶')) state.hasFocusSash = true;
    if (safeNote.includes('逃脱按鈕')) state.hasEjectButton = true;
    if (safeNote.includes('凸凸頭盔')) state.hasRockyHelmet = true;
    if (safeNote.includes('弱點保險')) state.hasWeaknessPolicy = true;
    const tmMatch = safeNote.match(/TM學習器:\s*(\S+)/);
    if (tmMatch) { if (!state.tms) state.tms = {}; state.tms[tmMatch[1]] = (state.tms[tmMatch[1]] || 0) + 1; }
    }

    let m;
    if ((m = safeNote.match(/消耗(\d+)瓶好傷藥/))) state.potions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶活力塊/))) state.revives -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶神奇糖果/))) state.candies -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶全滿藥/))) state.maxPotions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶元氣藥塊/))) state.maxRevives -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)個橙橙果/))) state.oranBerries = Math.max(0, (state.oranBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個奇異果/))) state.cheriBerries = Math.max(0, (state.cheriBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個木子果/))) state.lumBerries = Math.max(0, (state.lumBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個抗性果/))) state.chilanBerries = Math.max(0, (state.chilanBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個氣勢披帶/))) state.hasFocusSash = false;
    if ((m = safeNote.match(/消耗(\d+)個弱點保險/))) state.hasWeaknessPolicy = false;
    if ((m = safeNote.match(/消耗(\d+)個TM學習器/))) { const tmN = safeNote.match(/TM學習器:\s*(\S+)/); if (tmN && state.tms) state.tms[tmN[1]] = Math.max(0, (state.tms[tmN[1]]||0) - parseInt(m[1])); }

    if (rowAction === 'A' || rowAction === '捕捉') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1] || 'legacy_' + evt.id;
      const pNameRaw = ((safeNote.match(/獲得:\s*([^|]+)/) || [])[1] || '未知寶可夢 (一般系)').trim();
      let initLv = score >= 95 ? Math.max(5, Math.floor(score / 4)) : (score >= 75 ? Math.max(5, Math.floor(score / 6)) : Math.max(5, Math.floor(score / 8)));
      const lvMatch = pNameRaw.match(/(.+?)\s*\(Lv\.(\d+)\)/);
      if (lvMatch) { initLv = parseInt(lvMatch[2], 10); }
      const lvFromNote = safeNote.match(/\|\s*Lv\.(\d+)\s*\|/);
      if (lvFromNote) initLv = parseInt(lvFromNote[1], 10);
      initLv = Math.min(initLv, Math.max(5, (state.lockedGymLevel || 5)) + 3);
      const cleanName = pNameRaw.includes('(') ? pNameRaw : pNameRaw + ' (一般系)';
      const fixedName = _fixEvoNameAfterCap(cleanName, initLv);
      if (!state.roster[pid]) {
        state.roster[pid] = {
          id: pid, baseName: fixedName, totalExp: 0, initialLevel: initLv,
          catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`,
          heldItem: ''
        };
      }
    } else if (rowAction === '道具裝備') {
      const HELD_NAMES = { expShare: '學習裝置', expertBelt: '達人帶', eviolite: '進化奇石', championCloak: '冠軍披風', amuletCoin: '護符金幣', quickClaw: '先制之爪', focusLens: '焦點鏡', shellBell: '貝殼之鈴', lifeOrb: '生命寶珠', assaultVest: 'AV背心', focusSash: '氣勢披帶', ejectButton: '逃脱按鈕', rockyHelmet: '凸凸頭盔', weaknessPolicy: '弱點保險' };
      for (const [hid, hname] of Object.entries(HELD_NAMES)) {
        const ep = new RegExp(`裝備${hname}給\\s*ID:(\\S+)`);
        const em = safeNote.match(ep);
        if (em && state.roster[em[1]]) {
          for (const ek in state.roster) { if (state.roster[ek].heldItem === hid) state.roster[ek].heldItem = ''; }
          state.roster[em[1]].heldItem = hid;
        }
        if (safeNote.includes('卸下' + hname)) {
          for (const ek in state.roster) { if (state.roster[ek].heldItem === hid) state.roster[ek].heldItem = ''; }
        }
      }
    } else if (rowAction === 'B' || rowAction === '糖果升級') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1];
      if (pid) {
        for (const k in state.roster) {
          const isHolder = state.roster[k].heldItem === 'expShare';
          state.roster[k].totalExp += (k === pid) ? rowExp : (isHolder ? Math.floor(rowExp * 0.8) : Math.floor(rowExp * 0.5));
        }
      }
    } else if (rowAction === '戰鬥勝利') {
      const match = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      const parts = match ? match[1].split(',').map(s => s.trim()) : [];
      for (const k in state.roster) {
        const isHolder = state.roster[k].heldItem === 'expShare';
        state.roster[k].totalExp += (parts.includes(k)) ? rowExp : (isHolder ? Math.floor(rowExp * 0.8) : Math.floor(rowExp * 0.5));
      }
      const bossMatch = safeNote.match(/🏆 捕獲:\s*([^|]+)/);
      if (bossMatch) {
        const bossId = 'P' + rowDate.getTime() + '_LEG';
        const bossName = (bossMatch[1].trim().includes('(') ? bossMatch[1].trim() : bossMatch[1].trim() + ' (一般系)');
        if (!state.roster[bossId]) {
          state.roster[bossId] = {
            id: bossId, baseName: bossName, totalExp: 0,
            initialLevel: Math.min(99, Math.max(5, state.lockedGymLevel) + 5),
            catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`,
            heldItem: ''
          };
        }
      }
      const isRowToday = rowDate.toDateString() === todayStr;
      const isRowThisWeek = rowDate.getTime() >= startOfWeek;
      const isRowThisMonth = rowDate.getTime() >= startOfMonth;
      if (isRowToday && (safeNote.includes('[Daily]') || safeNote.includes('路人') || safeNote.includes('Raid'))) state.todayBattles++;
      if (isRowThisWeek && (safeNote.includes('[Gym]') || safeNote.includes('道館'))) state.weekGymWins++;
      if (isRowThisMonth && (safeNote.includes('[League]') || safeNote.includes('大會') || safeNote.includes('魔王'))) { state.monthLeagueWins++; const lr = safeNote.match(/\[(.+?)\s*League\]/); if (lr) state.leagueRegionsWon[lr[1]] = true; }
    } else if (rowAction === 'E') {
      const nm = safeNote.match(/獲得:\s*([^|]+)/);
      if (nm && state.roster['P0']) {
        const newName = (nm[1].trim().includes('(') ? nm[1].trim() : nm[1].trim() + ' (一般系)');
        state.roster['P0'].baseName = newName;
      }
      // 新格式: 進化ID:{pokemonId} => {newName}
      const evoMatch = safeNote.match(/進化ID:(\S+)\s*=>\s*(.+)/);
      if (evoMatch && state.roster[evoMatch[1]]) {
        state.roster[evoMatch[1]].baseName = evoMatch[2].trim();
      }
    } else if (rowAction === '滿級轉化') {
      state.coins += rowCoins;
    } else if (rowAction === 'trade') {
      if (evt.tradeType === 'recv' && evt.tradedPokemon) {
        try {
          const tradedPkmn = JSON.parse(evt.tradedPokemon);
          const pid = evt.tradePokemonId || tradedPkmn.id;
          tradedPkmn.heldItem = tradedPkmn.heldItem || '';
          tradedPkmn.catchDate = tradedPkmn.catchDate || `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`;
          state.roster[pid] = tradedPkmn;
        } catch (e) { console.warn('trade recv parse error:', e); }
      } else if (evt.tradeType === 'send' && evt.tradePokemonId) {
        delete state.roster[evt.tradePokemonId];
      }
    }

    let currentIterLevel = 5;
    for (const k in state.roster) {
      const lvlInfo = calcLevelAndExp(state.roster[k].totalExp, state.roster[k].initialLevel);
      if (lvlInfo.level > currentIterLevel) currentIterLevel = lvlInfo.level;
    }
    state.highestLevel = currentIterLevel;
    if (rowBadges > 0) state.lockedGymLevel = state.highestLevel;
    state.lastEventTimestamp = rowDate.toISOString();
  }

  state.daysSinceLastBadge = state.lastBadgeTime
    ? (Date.now() - state.lastBadgeTime) / 86400000
    : (state.firstLogTime ? (Date.now() - state.firstLogTime) / 86400000 : 0);

  state.submitStreak = 0;
  const sortedSubDates = Object.keys(state.submitDates).sort((a, b) => new Date(b) - new Date(a));
  for (let si = 0; si < sortedSubDates.length; si++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - si);
    if (sortedSubDates[si] === expected.toDateString()) state.submitStreak++;
    else break;
  }

  const rosterArray = [];
  let finalHighestLevel = 5;
  for (const k in state.roster) {
    const p = state.roster[k];
    const lvlInfo = calcLevelAndExp(p.totalExp, p.initialLevel);
    p.currentLevel = lvlInfo.level;
    p.expProgress = lvlInfo.expProgress;
    p.expNeeded = lvlInfo.expNeeded;
    if (state._happinessEvents && state._happinessEvents[p.id]) {
      p.happiness = (p.happiness || 0) + state._happinessEvents[p.id];
    } else {
      p.happiness = p.happiness || 0;
    }
    if (p.currentLevel > finalHighestLevel) finalHighestLevel = p.currentLevel;
    rosterArray.push(p);
  }

  // F4: quest progress
  const quests = computeQuestProgress(events);
  // Preserve claimed status from existing Firestore data
  try {
    const existingDoc = await db.collection(STUDENTS_COL).doc(studentId).get();
    if (existingDoc.exists && existingDoc.data().quests) {
      const eq = existingDoc.data().quests;
      const now = new Date();
      const todayStr = now.toDateString();
      const weekStartStr = getStartOfWeek(now).toDateString();
      if (eq.daily && eq.daily.resetKey === todayStr) {
        for (const k in eq.daily.claimed) quests.daily.claimed[k] = eq.daily.claimed[k];
      }
      if (eq.weekly && eq.weekly.resetKey === weekStartStr) {
        for (const k in eq.weekly.claimed) quests.weekly.claimed[k] = eq.weekly.claimed[k];
      }
    }
  } catch(e) {
    // ignore read errors
  }

  return {
    studentId: state.studentId,
    highestLevel: finalHighestLevel,
    lockedGymLevel: state.lockedGymLevel,
    coins: state.coins,
    badges: state.badges,
    potions: state.potions,
    revives: state.revives,
    candies: state.candies,
    maxPotions: state.maxPotions,
    maxRevives: state.maxRevives,
    expSharePurchased: state.expSharePurchased || false,
    hasExpertBelt: state.hasExpertBelt,
    hasEviolite: state.hasEviolite,
    hasChampionCloak: state.hasChampionCloak,
    hasAmuletCoin: state.hasAmuletCoin,
    hasQuickClaw: state.hasQuickClaw,
    hasFocusLens: state.hasFocusLens,
    hasShellBell: state.hasShellBell,
    hasLifeOrb: state.hasLifeOrb,
    hasAssaultVest: state.hasAssaultVest,
    '電擊盒': state.電擊盒 || false,
    '岩漿盒': state.岩漿盒 || false,
    '龍之鱗片': state['龍之鱗片'] || false,
    '護具': state.護具 || false,
    '金屬膜': state.金屬膜 || false,
    '王者之證': state['王者之證'] || false,
    todayCompleted: state.todayCompleted,
    daysSinceLastBadge: state.daysSinceLastBadge,
    roster: rosterArray,
    todayBattles: state.todayBattles,
    weekGymWins: state.weekGymWins,
    monthLeagueWins: state.monthLeagueWins,
    quests: quests,
    submitStreak: state.submitStreak || 0,
    oranBerries: state.oranBerries || 0,
    cheriBerries: state.cheriBerries || 0,
    lumBerries: state.lumBerries || 0,
    chilanBerries: state.chilanBerries || 0,
    hasFocusSash: state.hasFocusSash || false,
    hasEjectButton: state.hasEjectButton || false,
    hasRockyHelmet: state.hasRockyHelmet || false,
    hasWeaknessPolicy: state.hasWeaknessPolicy || false,
    tms: state.tms || {},
    simpleMode: state.simpleMode || false,
    leagueRegionsWon: state.leagueRegionsWon || {},
    lastUpdated: Timestamp.now()
  };
}

async function getDefaultSubjects() {
  const snapshot = await db.collection(SUBJECTS_COL).orderBy('order').get();
  const existing = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const existingNames = new Set(existing.map(s => s.name));

  const allDefaults = [
    { name: '📐 數理道館', category: 'gym', maxScore: 30, order: 0,
      tasks: [
        { name: '劉威宏/南PC (代數先修)', score: 15 },
        { name: '計算練習與私中魔王題', score: 15 }
      ] },
    { name: '📖 國語道館', category: 'gym', maxScore: 25, order: 1,
      tasks: [
        { name: '國學與字音字形特訓', score: 15 },
        { name: '閱讀測驗與古詩文', score: 10 }
      ] },
    { name: '🎧 英文道館', category: 'gym', maxScore: 25, order: 2,
      tasks: [
        { name: 'PET/FCE 與聽力特訓', score: 15 },
        { name: 'NonFiction 與雜誌閱讀', score: 10 }
      ] },
    { name: '✨ 紀律與體能修練', category: 'daily', maxScore: 20, order: 3,
      tasks: [
        { name: '跳繩500下 / 運動30分', score: 5, discipline: true },
        { name: '小提琴專注練習', score: 5, discipline: true },
        { name: '家務小幫手', score: 5, discipline: true },
        { name: '晚上 22:15 前就寢', score: 5, discipline: true }
      ] },
  ];

  if (snapshot.empty) {
    const batch = db.batch();
    for (const subj of allDefaults) {
      batch.set(db.collection(SUBJECTS_COL).doc(), subj);
    }
    await batch.commit();
    return allDefaults;
  }

  const batch = db.batch();
  let added = 0;
  for (const subj of allDefaults) {
    if (existingNames.has(subj.name)) continue;
    const ref = db.collection(SUBJECTS_COL).doc();
    batch.set(ref, subj);
    existing.push(subj);
    added++;
  }
  if (added > 0) {
    await batch.commit();
  }
  return existing;
}

module.exports = {
  getStartOfWeek, getStartOfMonth, getExpNeeded, calcLevelAndExp,
  getStudentEvents, recalculateStudentState, getDefaultSubjects,
  computeQuestProgress
};
