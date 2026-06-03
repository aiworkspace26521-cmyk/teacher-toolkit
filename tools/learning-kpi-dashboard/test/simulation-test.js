#!/usr/bin/env node
/**
 * teacher-toolkit 學習 KPI 管理系統 — 9 個月模擬測試
 *
 * Simulates two students ("max" = 100% daily, "min" = 60% daily) through
 * 9 months (M1-M9) of gameplay to find bugs, balance issues, and edge cases.
 *
 * Usage: node simulation-test.js
 * Dependencies: Node.js built-in modules only
 */

'use strict';

// =========================================================================
// SECTION 1 — ALL GAME CONSTANTS extracted from kpi-dashboard.html
// =========================================================================

const MOVE_DATABASE = {
  "撞擊":   { power: 40,  type: "一般",  category: "物理", desc: "用身體撞向對手" },
  "叫聲":   { power: 0,   type: "一般",  category: "變化", desc: "降低對手攻擊", effect: "debuff_atk" },
  "抓":     { power: 40,  type: "一般",  category: "物理", desc: "用爪子撕裂" },
  "火花":   { power: 40,  type: "火",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "水槍":   { power: 40,  type: "水",    category: "特殊", desc: "向對手噴水" },
  "飛葉快刀": { power: 55, type: "草",   category: "物理", desc: "投擲樹葉攻擊" },
  "十萬伏特": { power: 90, type: "電",   category: "特殊", desc: "可能麻痹對手", effect: "paralyze" },
  "冷凍光束": { power: 90, type: "冰",   category: "特殊", desc: "可能凍結對手", effect: "freeze" },
  "精神強念": { power: 90, type: "超能力", category: "特殊", desc: "可能降低特防" },
  "暗影球": { power: 80,  type: "幽靈",  category: "特殊", desc: "可能降低特防" },
  "噴射火焰": { power: 90, type: "火",   category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "熱水":   { power: 80,  type: "水",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "能量球": { power: 90,  type: "草",    category: "特殊", desc: "可能降低特防" },
  "打雷":   { power: 110, type: "電",    category: "特殊", desc: "可能麻痹對手", effect: "paralyze" },
  "暴風雪": { power: 110, type: "冰",    category: "特殊", desc: "可能凍結對手", effect: "freeze" },
  "大字爆": { power: 110, type: "火",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "水炮":   { power: 110, type: "水",    category: "特殊", desc: "向對手發射強力水柱" },
  "日光束": { power: 120, type: "草",    category: "特殊", desc: "吸收陽光後攻擊" },
  "地震":   { power: 100, type: "地面",  category: "物理", desc: "引發地震攻擊" },
  "岩石封鎖": { power: 60, type: "岩石", category: "物理", desc: "降低對手速度" },
  "毒擊":   { power: 80,  type: "毒",    category: "物理", desc: "可能中毒對手", effect: "poison" },
  "意念頭錘": { power: 80, type: "超能力", category: "物理", desc: "可能讓對手畏縮" },
  "暗襲要害": { power: 70, type: "惡",   category: "物理", desc: "容易擊中要害" },
  "鐵尾":   { power: 100, type: "鋼",    category: "物理", desc: "可能降低對手防禦" },
  "魔法閃耀": { power: 80, type: "妖精", category: "特殊", desc: "發出耀眼光芒" },
  "龍之波動": { power: 85, type: "龍",   category: "特殊", desc: "釋放龍之能量" },
  "冰雹":   { power: 0,   type: "冰",    category: "變化", desc: "天氣變成冰雹", effect: "weather_hail" },
  "冰礫":   { power: 40,  type: "冰",    category: "物理", desc: "先制攻擊" },
  "祈雨":   { power: 0,   type: "水",    category: "變化", desc: "天氣變成下雨", effect: "weather_rain" },
  "大晴天": { power: 0,   type: "火",    category: "變化", desc: "天氣變成大晴天", effect: "weather_sun" },
  "沙暴":   { power: 0,   type: "岩石",  category: "變化", desc: "天氣變成沙暴", effect: "weather_sand" },
  "翅膀攻擊": { power: 60, type: "飛行", category: "物理", desc: "用翅膀攻擊" },
  "蟲鳴":   { power: 90,  type: "蟲",    category: "特殊", desc: "可能降低特防" },
  "咬碎":   { power: 80,  type: "惡",    category: "物理", desc: "可能降低防禦" },
  "冰凍拳": { power: 75,  type: "冰",    category: "物理", desc: "可能凍結對手", effect: "freeze" },
  "雷電拳": { power: 75,  type: "電",    category: "物理", desc: "可能麻痹對手", effect: "paralyze" },
  "火焰拳": { power: 75,  type: "火",    category: "物理", desc: "可能燒傷對手", effect: "burn" },
  "污泥炸彈": { power: 90, type: "毒",   category: "特殊", desc: "可能中毒對手", effect: "poison" },
  "影子偷襲": { power: 40, type: "幽靈", category: "物理", desc: "先制攻擊" },
  "真氣彈": { power: 120, type: "格鬥",  category: "特殊", desc: "可能降低特防" },
  "近身戰": { power: 120, type: "格鬥",  category: "物理", desc: "降低雙防" },
  "飛身重壓": { power: 100, type: "格鬥", category: "物理", desc: "從空中壓向對手" },
  "鐵頭":   { power: 80,  type: "鋼",    category: "物理", desc: "可能讓對手畏縮" },
  "噴射拳": { power: 40,  type: "水",    category: "物理", desc: "先制攻擊" },
  "突襲":   { power: 70,  type: "惡",    category: "物理", desc: "先制攻擊" },
  "吸取拳": { power: 75,  type: "格鬥",  category: "物理", desc: "回復傷害一半HP" },
  "飛葉風暴": { power: 110, type: "草",  category: "特殊", desc: "大幅降低特攻" },
  "月亮之力": { power: 95, type: "妖精", category: "特殊", desc: "可能降低特攻" },
  "龍星群": { power: 120, type: "龍",   category: "特殊", desc: "大幅降低特攻" },
  "巨聲":   { power: 90,  type: "一般",  category: "特殊", desc: "發出巨大聲波" },
  "精神衝擊": { power: 80, type: "超能力", category: "特殊", desc: "造成物理傷害" },
  "高速星星": { power: 60, type: "一般", category: "特殊", desc: "必定命中" },
  "劍舞":   { power: 0,   type: "一般",  category: "變化", desc: "大幅提升攻擊", effect: "buff_atk" },
  "冥想":   { power: 0,   type: "超能力", category: "變化", desc: "提升特攻和特防", effect: "buff_spatk_spdef" },
  "龍之舞": { power: 0,   type: "龍",    category: "變化", desc: "提升攻擊和速度", effect: "buff_atk_speed" },
  "電光一閃": { power: 40, type: "一般", category: "物理", desc: "先制攻擊" },
  "摔打":   { power: 80,  type: "一般",  category: "物理", desc: "用尾巴或藤蔓抽打" },
  "泰山壓頂": { power: 85, type: "一般", category: "物理", desc: "可能麻痹對手", effect: "paralyze" },
  "破壞光線": { power: 150, type: "一般", category: "特殊", desc: "需要一回合準備" },
};

const TYPE_MOVE_POOL = {
  "水":   ["撞擊","祈雨","水之波動","衝浪","水炮"],
  "火":   ["火花","大晴天","噴射火焰","大字爆炎","大字爆"],
  "草":   ["藤鞭","飛葉快刀","種子炸彈","能量球","日光束"],
  "電":   ["電擊","電光一閃","雷電拳","十萬伏特","打雷"],
  "飛行": ["起風","翅膀攻擊","鑽啄","颱風","勇鳥猛攻"],
  "一般": ["撞擊","電光一閃","摔打","巨聲","破壞光線"],
  "龍":   ["龍捲風","龍之波動","龍爪","逆鱗","龍星群"],
  "妖精": ["妖精之風","魔法閃耀","月亮之力","月亮之力","月亮之力"],
  "地面": ["潑沙","泥巴射擊","重踏","地震","斷崖之劍"],
  "格鬥": ["碎岩","空手劈","地獄翻滾","近身戰","真氣彈"],
  "超能力":["念力","幻象光線","精神強念","預知未來","創造完"],
  "幽靈": ["舌舔","影子偷襲","暗影球","暗影球","暗影球"],
  "毒":   ["毒針","溶解液","污泥炸彈","垃圾射擊","垃圾射擊"],
  "鋼":   ["金屬爪","鐵頭","重磅衝撞","鐵尾","加農光炮"],
  "惡":   ["抓","暗襲要害","咬碎","突襲","暗黑洞"],
  "冰":   ["冰礫","冰雹","冰凍牙","冰凍光束","暴風雪"],
  "蟲":   ["蟲咬","蟲鳴","十字剪","十字剪","超級角擊"],
  "岩石": ["落石","沙暴","岩崩","尖石攻擊","雙刃頭錘"]
};

const SIGNATURE_MOVES = {
  "超夢":    { name:"精神擊破", type:"超能力", power:100, category:"特殊" },
  "火焰鳥":  { name:"神鳥猛擊", type:"飛行",   power:140, category:"物理" },
  "烈空坐":  { name:"畫龍點睛", type:"飛行",   power:120, category:"物理" },
  "洛奇亞":  { name:"氣旋攻擊", type:"飛行",   power:100, category:"特殊" },
  "鳳王":    { name:"神聖之火", type:"火",     power:100, category:"物理" },
  "帝牙盧卡":{ name:"時光咆哮", type:"龍",     power:150, category:"特殊" }
};

const POKEMON_TIERS = {
  "一般": [
    { name: "波波", evolutions: ["比比鳥","大比鳥"] },
    { name: "烈雀", evolutions: ["大嘴雀"] },
    { name: "小拉達", evolutions: ["拉達"] },
    { name: "胖丁", evolutions: ["胖可丁"] },
    { name: "皮皮", evolutions: ["皮可西"] },
    { name: "咕咕", evolutions: ["貓頭夜鷹"] },
    { name: "尾立", evolutions: ["大尾立"] },
    { name: "土狼犬", evolutions: ["大狼犬"] },
    { name: "蛇紋熊", evolutions: ["直衝熊"] },
    { name: "姆克兒", evolutions: ["姆克鳥","姆克鷹"] },
    { name: "小貓怪", evolutions: ["勒克貓","倫琴貓"] },
    { name: "伊布", evolutions: ["水伊布","雷伊布","火伊布","太陽伊布","月亮伊布","葉伊布","冰伊布","仙子伊布"] },
    { name: "綠毛蟲", evolutions: ["鐵甲蛹","巴大蝶"] },
    { name: "獨角蟲", evolutions: ["鐵殼蛹","大針蜂"] },
    { name: "阿柏蛇", evolutions: ["阿柏怪"] },
    { name: "穿山鼠", evolutions: ["穿山王"] },
    { name: "超音蝠", evolutions: ["大嘴蝠"] },
    { name: "派拉斯", evolutions: ["派拉斯特"] },
    { name: "毛球", evolutions: ["末入蛾"] },
    { name: "地鼠", evolutions: ["三地鼠"] },
    { name: "可達鴨", evolutions: ["哥達鴨"] },
    { name: "猴怪", evolutions: ["火爆猴"] },
    { name: "蚊香蝌蚪", evolutions: ["蚊香君","蚊香泳士"] },
    { name: "喇叭芽", evolutions: ["口呆花","大食花"] },
    { name: "瑪瑙水母", evolutions: ["毒刺水母"] },
    { name: "小拳石", evolutions: ["隆隆石","隆隆岩"] },
    { name: "大舌貝", evolutions: ["刺甲貝"] },
    { name: "鬼斯", evolutions: ["鬼斯通","耿鬼"] },
    { name: "大鉗蟹", evolutions: ["巨鉗蟹"] },
    { name: "霹靂電球", evolutions: ["頑皮雷彈"] },
    { name: "蛋蛋", evolutions: ["椰蛋樹"] },
    { name: "墨海馬", evolutions: ["海刺龍"] },
    { name: "角金魚", evolutions: ["金魚王"] },
    { name: "海星星", evolutions: ["寶石海星"] },
    { name: "鯉魚王", evolutions: ["暴鯉龍"] },
    { name: "嘟嘟", evolutions: ["嘟嘟利"] },
    { name: "小海獅", evolutions: ["白海獅"] },
    { name: "臭泥", evolutions: ["臭臭泥"] },
    { name: "大岩蛇" },
    { name: "素利普", evolutions: ["素利拍"] },
    { name: "大蔥鴨" },
    { name: "卡拉卡拉", evolutions: ["嘎啦嘎啦"] },
    { name: "瓦斯彈", evolutions: ["雙彈瓦斯"] },
    { name: "獨角犀牛", evolutions: ["鑽角犀獸"] }
  ],
  "稀有": [
    { name: "小火龍", evolutions: ["火恐龍","噴火龍"] },
    { name: "妙蛙種子", evolutions: ["妙蛙草","妙蛙花"] },
    { name: "傑尼龜", evolutions: ["卡咪龜","水箭龜"] },
    { name: "電擊怪", evolutions: ["電擊獸","電擊魔獸"] },
    { name: "鴨嘴寶寶", evolutions: ["鴨嘴火獸","鴨嘴炎獸"] },
    { name: "迷你龍", evolutions: ["哈克龍","快龍"] },
    { name: "由基拉", evolutions: ["沙基拉","班基拉斯"] },
    { name: "寶貝龍", evolutions: ["甲殼龍","暴飛龍"] },
    { name: "鐵啞鈴", evolutions: ["金屬怪","巨金怪"] },
    { name: "利歐路", evolutions: ["路卡利歐"] },
    { name: "拉魯拉絲", evolutions: ["奇魯莉安","沙奈朵","艾路雷朵"] },
    { name: "圓陸鯊", evolutions: ["尖牙陸鯊","烈咬陸鯊"] },
    { name: "黏黏寶", evolutions: ["黏美兒","黏美龍"] },
    { name: "心鱗寶", evolutions: ["鱗甲龍","杖尾鱗甲龍"] },
    { name: "火稚雞", evolutions: ["力壯雞","火焰雞"] },
    { name: "木守宮", evolutions: ["森林蜥蜴","蜥蜴王"] },
    { name: "水躍魚", evolutions: ["沼躍魚","巨沼怪"] },
    { name: "菊草葉", evolutions: ["月桂葉","大菊花"] },
    { name: "火球鼠", evolutions: ["火岩鼠","火爆獸"] },
    { name: "小鋸鱷", evolutions: ["藍鱷","大力鱷"] },
    { name: "藤藤蛇", evolutions: ["青藤蛇","君主蛇"] },
    { name: "暖暖豬", evolutions: ["炒炒豬","炎武王"] },
    { name: "球海獅", evolutions: ["花漾海獅","西獅海壬"] },
    { name: "木木梟", evolutions: ["投羽梟","狙射樹梟"] },
    { name: "火斑喵", evolutions: ["炎熱喵","熾焰咆哮虎"] },
    { name: "淚眼蜥", evolutions: ["變澀蜥","千面避役"] },
    { name: "敲音猴", evolutions: ["啪咚猴","轟擂金剛猩"] },
    { name: "炎兔兒", evolutions: ["騰蹴小將","閃焰王牌"] },
    { name: "皮卡丘", evolutions: ["雷丘"] },
    { name: "六尾", evolutions: ["九尾"] },
    { name: "走路草", evolutions: ["臭臭花","霸王花"] },
    { name: "尼多蘭", evolutions: ["尼多娜","尼多后"] },
    { name: "尼多朗", evolutions: ["尼多力諾","尼多王"] },
    { name: "喵喵", evolutions: ["貓老大"] },
    { name: "卡蒂狗", evolutions: ["風速狗"] },
    { name: "凱西", evolutions: ["勇基拉","胡地"] },
    { name: "腕力", evolutions: ["豪力","怪力"] },
    { name: "小火馬", evolutions: ["烈焰馬"] },
    { name: "呆呆獸", evolutions: ["呆殼獸"] },
    { name: "小磁怪", evolutions: ["三合一磁怪"] },
    { name: "飛腿郎" }, { name: "快拳郎" }, { name: "大舌頭" },
    { name: "飛天螳螂" }, { name: "吉利蛋" }, { name: "蔓藤怪" },
    { name: "袋獸" }, { name: "魔牆人偶" }, { name: "迷唇姐" },
    { name: "大甲" }, { name: "肯泰羅" }, { name: "拉普拉斯" },
    { name: "百變怪" }, { name: "多邊獸" },
    { name: "菊石獸", evolutions: ["多刺菊石獸"] },
    { name: "化石盔", evolutions: ["鐳射盔"] },
    { name: "化石翼龍" }, { name: "卡比獸" }
  ],
  "傳說": [
    { name: "超夢", legendary: true }, { name: "洛奇亞", legendary: true },
    { name: "鳳王", legendary: true }, { name: "蓋歐卡", legendary: true },
    { name: "固拉多", legendary: true }, { name: "烈空坐", legendary: true },
    { name: "帝牙盧卡", legendary: true }, { name: "帕路奇亞", legendary: true },
    { name: "騎拉帝納", legendary: true }, { name: "阿爾宙斯", legendary: true },
    { name: "萊希拉姆", legendary: true }, { name: "捷克羅姆", legendary: true },
    { name: "酋雷姆", legendary: true }, { name: "哲爾尼亞斯", legendary: true },
    { name: "伊裴爾塔爾", legendary: true }, { name: "基格爾德", legendary: true },
    { name: "索爾迦雷歐", legendary: true }, { name: "露奈雅拉", legendary: true },
    { name: "無極汰那", legendary: true }, { name: "故勒頓", legendary: true },
    { name: "密勒頓", legendary: true }, { name: "厄鬼椪", legendary: true },
    { name: "太樂巴戈斯", legendary: true },
    { name: "急凍鳥", legendary: true }, { name: "閃電鳥", legendary: true },
    { name: "火焰鳥", legendary: true }, { name: "夢幻", legendary: true }
  ]
};

const POKEMON_SPECIES_TYPES = {
  "波波":["一般","飛行"],"比比鳥":["一般","飛行"],"大比鳥":["一般","飛行"],
  "烈雀":["一般","飛行"],"大嘴雀":["一般","飛行"],
  "小拉達":["一般"],"拉達":["一般"],
  "胖丁":["一般","妖精"],"胖可丁":["一般","妖精"],
  "皮皮":["妖精"],"皮可西":["妖精"],
  "咕咕":["一般","飛行"],"貓頭夜鷹":["一般","飛行"],
  "尾立":["一般"],"大尾立":["一般"],
  "土狼犬":["惡"],"大狼犬":["惡"],
  "蛇紋熊":["一般"],"直衝熊":["一般"],
  "姆克兒":["一般","飛行"],"姆克鳥":["一般","飛行"],"姆克鷹":["一般","飛行"],
  "小貓怪":["電"],"勒克貓":["電"],"倫琴貓":["電"],
  "伊布":["一般"],
  "水伊布":["水"],"雷伊布":["電"],"火伊布":["火"],
  "太陽伊布":["超能力"],"月亮伊布":["惡"],
  "葉伊布":["草"],"冰伊布":["冰"],"仙子伊布":["妖精"],
  "小火龍":["火"],"火恐龍":["火"],"噴火龍":["火","飛行"],
  "妙蛙種子":["草","毒"],"妙蛙草":["草","毒"],"妙蛙花":["草","毒"],
  "傑尼龜":["水"],"卡咪龜":["水"],"水箭龜":["水"],
  "電擊怪":["電"],"電擊獸":["電"],"電擊魔獸":["電"],
  "鴨嘴寶寶":["火"],"鴨嘴火獸":["火"],"鴨嘴炎獸":["火"],
  "迷你龍":["龍"],"哈克龍":["龍"],"快龍":["龍","飛行"],
  "由基拉":["岩石","地面"],"沙基拉":["岩石","地面"],"班基拉斯":["岩石","惡"],
  "寶貝龍":["龍"],"甲殼龍":["龍"],"暴飛龍":["龍","飛行"],
  "鐵啞鈴":["鋼","超能力"],"金屬怪":["鋼","超能力"],"巨金怪":["鋼","超能力"],
  "利歐路":["格鬥"],"路卡利歐":["格鬥","鋼"],
  "拉魯拉絲":["超能力","妖精"],"奇魯莉安":["超能力","妖精"],"沙奈朵":["超能力","妖精"],"艾路雷朵":["超能力","格鬥"],
  "圓陸鯊":["龍","地面"],"尖牙陸鯊":["龍","地面"],"烈咬陸鯊":["龍","地面"],
  "黏黏寶":["龍"],"黏美兒":["龍"],"黏美龍":["龍"],
  "心鱗寶":["龍"],"鱗甲龍":["龍","格鬥"],"杖尾鱗甲龍":["龍","格鬥"],
  "火稚雞":["火"],"力壯雞":["火","格鬥"],"火焰雞":["火","格鬥"],
  "木守宮":["草"],"森林蜥蜴":["草"],"蜥蜴王":["草"],
  "水躍魚":["水"],"沼躍魚":["水","地面"],"巨沼怪":["水","地面"],
  "菊草葉":["草"],"月桂葉":["草"],"大菊花":["草"],
  "火球鼠":["火"],"火岩鼠":["火"],"火爆獸":["火"],
  "小鋸鱷":["水"],"藍鱷":["水"],"大力鱷":["水"],
  "藤藤蛇":["草"],"青藤蛇":["草"],"君主蛇":["草"],
  "暖暖豬":["火"],"炒炒豬":["火","格鬥"],"炎武王":["火","格鬥"],
  "球海獅":["水"],"花漾海獅":["水"],"西獅海壬":["水","妖精"],
  "木木梟":["草","飛行"],"投羽梟":["草","飛行"],"狙射樹梟":["草","幽靈"],
  "火斑喵":["火"],"炎熱喵":["火"],"熾焰咆哮虎":["火","惡"],
  "淚眼蜥":["水"],"變澀蜥":["水"],"千面避役":["水"],
  "敲音猴":["草"],"啪咚猴":["草"],"轟擂金剛猩":["草"],
  "炎兔兒":["火"],"騰蹴小將":["火"],"閃焰王牌":["火"],
  "超夢":["超能力"],
  "洛奇亞":["超能力","飛行"],"鳳王":["火","飛行"],
  "蓋歐卡":["水"],"固拉多":["地面"],"烈空坐":["龍","飛行"],
  "帝牙盧卡":["鋼","龍"],"帕路奇亞":["水","龍"],"騎拉帝納":["幽靈","龍"],
  "阿爾宙斯":["一般"],
  "萊希拉姆":["龍","火"],"捷克羅姆":["龍","電"],"酋雷姆":["龍","冰"],
  "哲爾尼亞斯":["妖精"],"伊裴爾塔爾":["惡","飛行"],"基格爾德":["龍","地面"],
  "索爾迦雷歐":["超能力","鋼"],"露奈雅拉":["超能力","幽靈"],
  "無極汰那":["毒","龍"],
  "故勒頓":["格鬥","龍"],"密勒頓":["電","龍"],
  "厄鬼椪":["草","幽靈"],"太樂巴戈斯":["一般","岩石"],
  "綠毛蟲":["蟲"],"鐵甲蛹":["蟲"],"巴大蝶":["蟲","飛行"],
  "獨角蟲":["蟲","毒"],"鐵殼蛹":["蟲","毒"],"大針蜂":["蟲","毒"],
  "阿柏蛇":["毒"],"阿柏怪":["毒"],
  "穿山鼠":["地面"],"穿山王":["地面"],
  "超音蝠":["毒","飛行"],"大嘴蝠":["毒","飛行"],
  "派拉斯":["蟲","草"],"派拉斯特":["蟲","草"],
  "毛球":["蟲","毒"],"末入蛾":["蟲","毒"],
  "地鼠":["地面"],"三地鼠":["地面"],
  "可達鴨":["水"],"哥達鴨":["水"],
  "猴怪":["格鬥"],"火爆猴":["格鬥"],
  "蚊香蝌蚪":["水"],"蚊香君":["水"],"蚊香泳士":["水","格鬥"],
  "喇叭芽":["草","毒"],"口呆花":["草","毒"],"大食花":["草","毒"],
  "瑪瑙水母":["水","毒"],"毒刺水母":["水","毒"],
  "小拳石":["岩石","地面"],"隆隆石":["岩石","地面"],"隆隆岩":["岩石","地面"],
  "大舌貝":["水"],"刺甲貝":["水","冰"],
  "鬼斯":["幽靈","毒"],"鬼斯通":["幽靈","毒"],"耿鬼":["幽靈","毒"],
  "大鉗蟹":["水"],"巨鉗蟹":["水"],
  "霹靂電球":["電"],"頑皮雷彈":["電"],
  "蛋蛋":["草","超能力"],"椰蛋樹":["草","超能力"],
  "墨海馬":["水"],"海刺龍":["水"],
  "角金魚":["水"],"金魚王":["水"],
  "海星星":["水"],"寶石海星":["水","超能力"],
  "鯉魚王":["水"],"暴鯉龍":["水","飛行"],
  "嘟嘟":["一般","飛行"],"嘟嘟利":["一般","飛行"],
  "小海獅":["水"],"白海獅":["水","冰"],
  "臭泥":["毒"],"臭臭泥":["毒"],
  "大岩蛇":["岩石","地面"],
  "素利普":["超能力"],"素利拍":["超能力"],
  "大蔥鴨":["一般","飛行"],
  "卡拉卡拉":["地面"],"嘎啦嘎啦":["地面"],
  "瓦斯彈":["毒"],"雙彈瓦斯":["毒"],
  "獨角犀牛":["地面","岩石"],"鑽角犀獸":["地面","岩石"],
  "皮卡丘":["電"],"雷丘":["電"],
  "六尾":["火"],"九尾":["火"],
  "走路草":["草","毒"],"臭臭花":["草","毒"],"霸王花":["草","毒"],
  "尼多蘭":["毒"],"尼多娜":["毒"],"尼多后":["毒","地面"],
  "尼多朗":["毒"],"尼多力諾":["毒"],"尼多王":["毒","地面"],
  "喵喵":["一般"],"貓老大":["一般"],
  "卡蒂狗":["火"],"風速狗":["火"],
  "凱西":["超能力"],"勇基拉":["超能力"],"胡地":["超能力"],
  "腕力":["格鬥"],"豪力":["格鬥"],"怪力":["格鬥"],
  "小火馬":["火"],"烈焰馬":["火"],
  "呆呆獸":["水","超能力"],"呆殼獸":["水","超能力"],
  "小磁怪":["電","鋼"],"三合一磁怪":["電","鋼"],
  "飛腿郎":["格鬥"],"快拳郎":["格鬥"],
  "大舌頭":["一般"],"飛天螳螂":["蟲","飛行"],"吉利蛋":["一般"],
  "蔓藤怪":["草"],"袋獸":["一般"],"魔牆人偶":["超能力","妖精"],
  "迷唇姐":["冰","超能力"],"大甲":["蟲"],"肯泰羅":["一般"],
  "拉普拉斯":["水","冰"],"百變怪":["一般"],"多邊獸":["一般"],
  "菊石獸":["岩石","水"],"多刺菊石獸":["岩石","水"],
  "化石盔":["岩石","水"],"鐳射盔":["岩石","水"],
  "化石翼龍":["岩石","飛行"],"卡比獸":["一般"],
  "急凍鳥":["冰","飛行"],"閃電鳥":["電","飛行"],"火焰鳥":["火","飛行"],
  "夢幻":["超能力"]
};

const TYPE_RATIO = {
  "水":[1.1,0.9,1.1,1.0,1.1,0.8],"火":[0.9,1.1,0.8,1.3,0.9,1.0],
  "草":[1.0,0.9,1.1,1.1,1.1,0.8],"電":[0.8,0.9,0.8,1.2,0.9,1.4],
  "飛行":[0.9,1.1,0.9,0.9,0.9,1.3],"一般":[1.0,1.0,1.0,1.0,1.0,1.0],
  "龍":[1.0,1.2,1.0,1.2,1.0,0.6],"妖精":[0.9,0.8,0.9,1.3,1.2,0.9],
  "地面":[1.2,1.2,1.2,0.7,0.9,0.8],"格鬥":[1.0,1.3,0.9,0.7,0.9,1.2],
  "超能力":[0.8,0.7,0.8,1.4,1.2,1.1],"幽靈":[0.8,1.1,0.9,1.2,1.0,1.0],
  "毒":[1.0,1.1,1.1,0.9,1.0,0.9],"鋼":[1.0,1.1,1.3,0.9,1.2,0.5],
  "惡":[1.0,1.3,0.9,1.0,0.9,1.1],"冰":[0.9,1.0,0.9,1.4,0.9,0.9],
  "蟲":[0.8,1.1,1.0,0.9,1.0,1.2],"岩石":[1.0,1.3,1.3,0.7,0.9,0.8]
};

const TYPE_CHART = {
  "一般": { "一般":1,"格鬥":1,"飛行":1,"毒":1,"地面":1,"岩石":0.5,"蟲":1,"幽靈":0,"鋼":0.5,"火":1,"水":1,"草":1,"電":1,"超能力":1,"冰":1,"龍":1,"惡":1,"妖精":1 },
  "格鬥": { "一般":2,"格鬥":1,"飛行":0.5,"毒":0.5,"地面":1,"岩石":2,"蟲":0.5,"幽靈":0,"鋼":2,"火":1,"水":1,"草":1,"電":1,"超能力":0.5,"冰":2,"龍":1,"惡":2,"妖精":0.5 },
  "飛行": { "一般":1,"格鬥":2,"飛行":1,"毒":1,"地面":1,"岩石":0.5,"蟲":2,"幽靈":1,"鋼":0.5,"火":1,"水":1,"草":2,"電":0.5,"超能力":1,"冰":1,"龍":1,"惡":1,"妖精":1 },
  "毒":   { "一般":1,"格鬥":1,"飛行":1,"毒":0.5,"地面":0.5,"岩石":0.5,"蟲":1,"幽靈":0.5,"鋼":0,"火":1,"水":1,"草":2,"電":1,"超能力":1,"冰":1,"龍":1,"惡":1,"妖精":2 },
  "地面": { "一般":1,"格鬥":1,"飛行":1,"毒":2,"地面":1,"岩石":2,"蟲":0.5,"幽靈":1,"鋼":2,"火":2,"水":1,"草":0.5,"電":2,"超能力":1,"冰":1,"龍":1,"惡":1,"妖精":1 },
  "岩石": { "一般":1,"格鬥":0.5,"飛行":2,"毒":1,"地面":0.5,"岩石":1,"蟲":2,"幽靈":1,"鋼":0.5,"火":2,"水":1,"草":1,"電":1,"超能力":1,"冰":2,"龍":1,"惡":1,"妖精":1 },
  "蟲":   { "一般":1,"格鬥":0.5,"飛行":0.5,"毒":0.5,"地面":1,"岩石":1,"蟲":1,"幽靈":0.5,"鋼":0.5,"火":0.5,"水":1,"草":2,"電":1,"超能力":1,"冰":1,"龍":1,"惡":2,"妖精":0.5 },
  "幽靈": { "一般":0,"格鬥":1,"飛行":1,"毒":1,"地面":1,"岩石":1,"蟲":1,"幽靈":2,"鋼":1,"火":1,"水":1,"草":1,"電":1,"超能力":2,"冰":1,"龍":1,"惡":0.5,"妖精":1 },
  "鋼":   { "一般":1,"格鬥":1,"飛行":1,"毒":1,"地面":1,"岩石":2,"蟲":1,"幽靈":1,"鋼":0.5,"火":0.5,"水":0.5,"草":1,"電":0.5,"超能力":1,"冰":2,"龍":1,"惡":1,"妖精":2 },
  "火":   { "一般":1,"格鬥":1,"飛行":1,"毒":1,"地面":1,"岩石":0.5,"蟲":2,"幽靈":1,"鋼":2,"火":0.5,"水":0.5,"草":2,"電":1,"超能力":1,"冰":2,"龍":0.5,"惡":1,"妖精":1 },
  "水":   { "一般":1,"格鬥":1,"飛行":1,"毒":1,"地面":2,"岩石":2,"蟲":1,"幽靈":1,"鋼":1,"火":2,"水":0.5,"草":0.5,"電":1,"超能力":1,"冰":1,"龍":0.5,"惡":1,"妖精":1 },
  "草":   { "一般":1,"格鬥":1,"飛行":0.5,"毒":0.5,"地面":2,"岩石":2,"蟲":0.5,"幽靈":1,"鋼":0.5,"火":0.5,"水":2,"草":0.5,"電":1,"超能力":1,"冰":1,"龍":0.5,"惡":1,"妖精":1 },
  "電":   { "一般":1,"格鬥":1,"飛行":2,"毒":1,"地面":0,"岩石":1,"蟲":1,"幽靈":1,"鋼":1,"火":1,"水":2,"草":0.5,"電":0.5,"超能力":1,"冰":1,"龍":0.5,"惡":1,"妖精":1 },
  "超能力":{"一般":1,"格鬥":2,"飛行":1,"毒":2,"地面":1,"岩石":1,"蟲":1,"幽靈":1,"鋼":0.5,"火":1,"水":1,"草":1,"電":1,"超能力":0.5,"冰":1,"龍":1,"惡":0,"妖精":1 },
  "冰":   { "一般":1,"格鬥":1,"飛行":2,"毒":1,"地面":2,"岩石":1,"蟲":1,"幽靈":1,"鋼":0.5,"火":0.5,"水":0.5,"草":2,"電":1,"超能力":1,"冰":0.5,"龍":2,"惡":1,"妖精":1 },
  "龍":   { "一般":1,"格鬥":1,"飛行":1,"毒":1,"地面":1,"岩石":1,"蟲":1,"幽靈":1,"鋼":0.5,"火":1,"水":1,"草":1,"電":1,"超能力":1,"冰":1,"龍":2,"惡":1,"妖精":0 },
  "惡":   { "一般":1,"格鬥":0.5,"飛行":1,"毒":1,"地面":1,"岩石":1,"蟲":1,"幽靈":2,"鋼":0.5,"火":1,"水":1,"草":1,"電":1,"超能力":2,"冰":1,"龍":1,"惡":0.5,"妖精":0.5 },
  "妖精": { "一般":1,"格鬥":2,"飛行":1,"毒":0.5,"地面":1,"岩石":1,"蟲":1,"幽靈":1,"鋼":0.5,"火":0.5,"水":1,"草":1,"電":1,"超能力":1,"冰":1,"龍":2,"惡":2,"妖精":1 }
};

const EVO_CONDITIONS = {
  "大嘴蝠": { type: "happiness", to: "叉字蝠", minLevel: 20, happiness: 180 },
  "吉利蛋": { type: "happiness", to: "幸福蛋", minLevel: 20, happiness: 180 },
  "電擊獸": { type: "item", to: "電擊魔獸", item: "電擊盒", minLevel: 30 },
  "鴨嘴火獸": { type: "item", to: "鴨嘴炎獸", item: "岩漿盒", minLevel: 30 },
  "海刺龍": { type: "item", to: "刺龍王", item: "龍之鱗片", minLevel: 30 },
  "鑽角犀獸": { type: "item", to: "超鐵暴龍", item: "護具", minLevel: 40 },
  "大岩蛇": { type: "item", to: "大鋼蛇", item: "金屬膜", minLevel: 30 },
  "飛天螳螂": { type: "item", to: "巨鉗螳螂", item: "金屬膜", minLevel: 30 },
  "呆呆獸": { type: "item", to: "呆殼獸", item: "王者之證", minLevel: 30 },
  "蚊香君": { type: "item", to: "蚊香泳士", item: "王者之證", minLevel: 30 },
  "勇基拉": { type: "trade", to: "胡地" },
  "豪力": { type: "trade", to: "怪力" },
  "隆隆石": { type: "trade", to: "隆隆岩" },
  "鬼斯通": { type: "trade", to: "耿鬼" },
};

const EVO_ITEMS = {
  "電擊盒": { cost: 50, icon: "📦", desc: "讓電擊獸進化為電擊魔獸" },
  "岩漿盒": { cost: 50, icon: "🌋", desc: "讓鴨嘴火獸進化為鴨嘴炎獸" },
  "龍之鱗片": { cost: 60, icon: "🐉", desc: "讓海刺龍進化為刺龍王" },
  "護具": { cost: 60, icon: "🛡️", desc: "讓鑽角犀獸進化為超鐵暴龍" },
  "金屬膜": { cost: 45, icon: "⚙️", desc: "讓特定寶可夢進化" },
  "王者之證": { cost: 55, icon: "👑", desc: "讓特定寶可夢進化" },
};

const HELD_ITEMS = {
  quickClaw:   { name: "先制之爪", cost: 100, icon: "🔪", desc: "20%機率先攻", flag: "hasQuickClaw" },
  focusLens:   { name: "焦點鏡",   cost: 80,  icon: "🔍", desc: "會心一擊機率2倍", flag: "hasFocusLens" },
  shellBell:   { name: "貝殼之鈴", cost: 90,  icon: "🔔", desc: "攻擊時回復12.5%傷害HP", flag: "hasShellBell" },
  lifeOrb:     { name: "生命寶珠", cost: 110, icon: "🔴", desc: "傷害x1.3但每次攻擊損失10%HP", flag: "hasLifeOrb" },
  assaultVest: { name: "AV背心",   cost: 100, icon: "🦺", desc: "特防x1.5但只能使用攻擊招式", flag: "hasAssaultVest" },
  focusSash:   { name: "氣勢披帶", cost: 150, icon: "🎗️", desc: "滿血時耐住必殺一擊（消耗品）", flag: "hasFocusSash" },
  ejectButton: { name: "逃脱按鈕", cost: 120, icon: "🔘", desc: "受到攻擊後強制換怪（消耗品）", flag: "hasEjectButton" },
  rockyHelmet: { name: "凸凸頭盔", cost: 130, icon: "⛑️", desc: "受到物理攻擊反傷1/6", flag: "hasRockyHelmet" },
  weaknessPolicy: { name: "弱點保險", cost: 140, icon: "📋", desc: "被剋時雙攻+2階（消耗品）", flag: "hasWeaknessPolicy" },
};

const GYM_LEADERS = [
  { region: "關都", badge: 1,  leader: "小剛", type: "岩石",    emoji: "🪨", name: "尼比道館",   waves: 3, lvBonus: 0, desc: "岩石般的基礎計算" },
  { region: "關都", badge: 2,  leader: "小霞", type: "水",      emoji: "💧", name: "華藍道館",   waves: 3, lvBonus: 2, desc: "如水般的靈活應用" },
  { region: "關都", badge: 3,  leader: "馬志士", type: "電",    emoji: "⚡", name: "枯葉道館",   waves: 3, lvBonus: 4, desc: "閃電般的速算反應" },
  { region: "關都", badge: 4,  leader: "莉佳", type: "草",      emoji: "🌿", name: "玉虹道館",   waves: 3, lvBonus: 6, desc: "扎根深厚的理解力" },
  { region: "關都", badge: 5,  leader: "阿桔", type: "毒",      emoji: "☠️", name: "淺紅道館",   waves: 4, lvBonus: 8, desc: "陷阱題的毒辣考驗" },
  { region: "關都", badge: 6,  leader: "娜姿", type: "超能力",  emoji: "🔮", name: "金黃道館",   waves: 4, lvBonus: 10, desc: "超能力般的邏輯推演" },
  { region: "關都", badge: 7,  leader: "夏伯", type: "火",      emoji: "🌋", name: "紅蓮道館",   waves: 4, lvBonus: 12, desc: "炙熱的燃燒鬥志" },
  { region: "關都", badge: 8,  leader: "阪木", type: "地面",    emoji: "🌍", name: "常磐道館",   waves: 4, lvBonus: 14, desc: "大地之巔的統治者" },
  { region: "城都", badge: 9,  leader: "阿速", type: "飛行",    emoji: "🦅", name: "桔梗道館",   waves: 4, lvBonus: 17, desc: "俯瞰全局的分析力" },
  { region: "城都", badge: 10, leader: "阿筆", type: "蟲",      emoji: "🐛", name: "檜皮道館",   waves: 4, lvBonus: 20, desc: "細心啃食每個知識點" },
  { region: "城都", badge: 11, leader: "小茜", type: "一般",    emoji: "🐾", name: "滿金道館",   waves: 5, lvBonus: 23, desc: "沒有捷徑的紮實訓練" },
  { region: "城都", badge: 12, leader: "松葉", type: "幽靈",    emoji: "👻", name: "圓朱道館",   waves: 5, lvBonus: 26, desc: "幽靈般的隱藏陷阱" },
  { region: "城都", badge: 13, leader: "阿四", type: "格鬥",    emoji: "🥋", name: "湛藍道館",   waves: 5, lvBonus: 30, desc: "硬碰硬的實力對決" },
  { region: "城都", badge: 14, leader: "小椿", type: "龍",      emoji: "🐉", name: "煙墨道館",   waves: 5, lvBonus: 33, desc: "龍之巔的極限挑戰" },
  { region: "城都", badge: 15, leader: "蜜柑", type: "鋼",      emoji: "⚙️", name: "淺蔥道館",   waves: 5, lvBonus: 36, desc: "鋼鐵般的精密計算" },
  { region: "城都", badge: 16, leader: "柳伯", type: "冰",      emoji: "❄️", name: "卡吉道館",   waves: 5, lvBonus: 39, desc: "冰封萬物的最終考驗" },
  { region: "合眾", badge: 17, leader: "天桐", type: "草",      emoji: "🌿", name: "三曜道館",   waves: 4, lvBonus: 42, desc: "三曜鼎立的智慧考驗" },
  { region: "合眾", badge: 18, leader: "蘆薈", type: "一般",    emoji: "🐾", name: "七寶道館",   waves: 4, lvBonus: 45, desc: "以不變應萬變的基礎" },
  { region: "合眾", badge: 19, leader: "亞堤", type: "蟲",      emoji: "🐛", name: "飛雲道館",   waves: 5, lvBonus: 49, desc: "編織知識之網的韌性" },
  { region: "合眾", badge: 20, leader: "小菊兒", type: "電",    emoji: "⚡", name: "雷文道館",   waves: 5, lvBonus: 51, desc: "閃耀的電流急急棒" },
  { region: "合眾", badge: 21, leader: "菊老大", type: "地面",  emoji: "🌍", name: "帆巴道館",   waves: 5, lvBonus: 54, desc: "大地深處的嚴峻考驗" },
  { region: "合眾", badge: 22, leader: "風露", type: "飛行",    emoji: "🦅", name: "吹寄道館",   waves: 5, lvBonus: 58, desc: "乘風破浪的高空對決" },
  { region: "合眾", badge: 23, leader: "哈奇庫", type: "冰",    emoji: "❄️", name: "雪花道館",   waves: 5, lvBonus: 62, desc: "絕對零度的極限專注" },
  { region: "合眾", badge: 24, leader: "艾莉絲", type: "龍",    emoji: "🐉", name: "雙龍道館",   waves: 5, lvBonus: 66, desc: "龍之霸主的最終試煉" },
  { region: "卡洛斯", badge: 25, leader: "紫羅蘭", type: "蟲",  emoji: "🦋", name: "白檀道館",   waves: 4, lvBonus: 64, desc: "觀察入微的蟲之眼" },
  { region: "卡洛斯", badge: 26, leader: "查克洛", type: "岩石", emoji: "🪨", name: "遙香道館",   waves: 4, lvBonus: 68, desc: "攀上岩壁的毅力" },
  { region: "卡洛斯", badge: 27, leader: "可爾妮", type: "格鬥", emoji: "🥋", name: "娑羅道館",   waves: 5, lvBonus: 72, desc: "百折不撓的格鬥魂" },
  { region: "卡洛斯", badge: 28, leader: "福爺", type: "草",    emoji: "🌿", name: "海翼道館",   waves: 5, lvBonus: 75, desc: "扎根知識的茂盛幹勁" },
  { region: "卡洛斯", badge: 29, leader: "瑪綉", type: "電",    emoji: "⚡", name: "密阿雷道館",   waves: 5, lvBonus: 78, desc: "華麗的電光交響曲" },
  { region: "卡洛斯", badge: 30, leader: "葛吉花", type: "超能力", emoji: "🔮", name: "香薰道館",   waves: 5, lvBonus: 81, desc: "預知未來的超能占卜" },
  { region: "卡洛斯", badge: 31, leader: "得撫", type: "惡",    emoji: "😈", name: "百刻道館",   waves: 5, lvBonus: 84, desc: "時間的暗影試煉" },
  { region: "卡洛斯", badge: 32, leader: "志米", type: "水",    emoji: "💧", name: "映雪道館",   waves: 5, lvBonus: 88, desc: "深不可測的水之巔峰" }
];

const LEAGUE_REGIONS = {
  "關都": {
    eliteFour: [
      { name: "科拿", type: "冰",   emoji: "❄️", lvBonus: 50, desc: "冰系天王 — 極寒的考驗" },
      { name: "希巴", type: "格鬥", emoji: "🥋", lvBonus: 55, desc: "格鬥天王 — 鋼鐵的意志" },
      { name: "菊子", type: "幽靈", emoji: "👻", lvBonus: 60, desc: "幽靈天王 — 詭譎的戰術" },
      { name: "阿渡", type: "龍",   emoji: "🐉", lvBonus: 65, desc: "龍系天王 — 龍之怒" }
    ],
    champion: { name: "青綠", type: "混合", emoji: "👑", lvBonus: 75, desc: "冠軍 — 全屬性的巔峰" },
    requiredBadges: 8, order: 0
  },
  "城都": {
    eliteFour: [
      { name: "一樹", type: "超能力", emoji: "🔮", lvBonus: 55, desc: "超能天王 — 念力的極致" },
      { name: "梨花", type: "惡",     emoji: "😈", lvBonus: 60, desc: "惡系天王 — 黑暗的戰術" },
      { name: "希爾斯", type: "鋼",   emoji: "⚙️", lvBonus: 65, desc: "鋼鐵天王 — 不動的防線" },
      { name: "小椿", type: "龍",     emoji: "🐉", lvBonus: 70, desc: "龍系天王 — 蒼空霸主" }
    ],
    champion: { name: "小銀", type: "混合", emoji: "👑", lvBonus: 80, desc: "冠軍 — 洗滌的靈魂" },
    requiredBadges: 16, order: 1
  },
  "豐緣": {
    eliteFour: [
      { name: "花月", type: "惡",     emoji: "🗡️", lvBonus: 60, desc: "惡系天王 — 華麗的暗殺" },
      { name: "芙蓉", type: "幽靈",   emoji: "👻", lvBonus: 65, desc: "幽靈天王 — 來自彼岸" },
      { name: "波妮", type: "冰",     emoji: "❄️", lvBonus: 70, desc: "冰系天王 — 絕對零度" },
      { name: "源治", type: "龍",     emoji: "🐉", lvBonus: 75, desc: "龍系天王 — 滄海老將" }
    ],
    champion: { name: "大吾", type: "鋼", emoji: "👑", lvBonus: 85, desc: "冠軍 — 石之意志" },
    requiredBadges: 20, order: 2
  },
  "神奧": {
    eliteFour: [
      { name: "阿李", type: "格鬥",   emoji: "🥋", lvBonus: 65, desc: "格鬥天王 — 鐵拳無敵" },
      { name: "勿忘", type: "地面",   emoji: "🌍", lvBonus: 70, desc: "地面天王 — 大地之怒" },
      { name: "大葉", type: "火",     emoji: "🔥", lvBonus: 75, desc: "火焰天王 — 燎原之火" },
      { name: "菊野", type: "超能力", emoji: "🔮", lvBonus: 80, desc: "超能天王 — 虛空行者" }
    ],
    champion: { name: "竹蘭", type: "混合", emoji: "👑", lvBonus: 90, desc: "冠軍 — 傳承的意志" },
    requiredBadges: 26, order: 3
  },
  "合眾": {
    eliteFour: [
      { name: "婉美", type: "蟲",     emoji: "🦋", lvBonus: 70, desc: "蟲系天王 — 美麗的陷阱" },
      { name: "蓮霧", type: "地面",   emoji: "🏜️", lvBonus: 75, desc: "地面天王 — 沙漠風暴" },
      { name: "嘉德麗雅", type: "超能力", emoji: "💜", lvBonus: 80, desc: "超能天王 — 華麗的夢境" },
      { name: "越橘", type: "惡",     emoji: "🌑", lvBonus: 85, desc: "惡系天王 — 闇夜的支配" }
    ],
    champion: { name: "艾莉絲", type: "龍", emoji: "👑", lvBonus: 95, desc: "冠軍 — 龍之少女" },
    requiredBadges: 32, order: 4
  },
  "卡洛斯": {
    eliteFour: [
      { name: "帕琦拉", type: "火",     emoji: "🔥", lvBonus: 75, desc: "火系天王 — 炙熱的真理" },
      { name: "志糜",   type: "水",     emoji: "💧", lvBonus: 80, desc: "水系天王 — 奔流的策略" },
      { name: "朵拉塞娜", type: "龍",   emoji: "🐉", lvBonus: 85, desc: "龍系天王 — 遠古的咆哮" },
      { name: "雁鎧",   type: "鋼",     emoji: "⚙️", lvBonus: 90, desc: "鋼鐵天王 — 不朽的壁壘" }
    ],
    champion: { name: "卡露妮", type: "混合", emoji: "👑", lvBonus: 100, desc: "冠軍 — 優雅與力量的化身" },
    requiredBadges: 32, order: 5
  }
};

const ACHIEVEMENTS = [
  { id: "FIRST_CAPTURE", name: "初次捕捉", desc: "捕捉第一隻寶可夢", icon: "🎯", tier: 1 },
  { id: "FIRST_GYM", name: "道館初戰", desc: "獲得第一枚道館徽章", icon: "🥇", tier: 1 },
  { id: "LV_10", name: "新星訓練家", desc: "達到 Lv.10", icon: "⭐", tier: 1 },
  { id: "COLLECTOR_10", name: "小小收藏家", desc: "收集 10 種寶可夢", icon: "📦", tier: 1 },
  { id: "GYM_8", name: "關都冠軍", desc: "收集 8 枚道館徽章", icon: "🏅", tier: 2 },
  { id: "LV_25", name: "精英訓練家", desc: "達到 Lv.25", icon: "💫", tier: 2 },
  { id: "COLLECTOR_25", name: "熱衷收藏家", desc: "收集 25 種寶可夢", icon: "🗃️", tier: 2 },
  { id: "LEGENDARY", name: "傳說捕手", desc: "捕捉傳說寶可夢", icon: "✨", tier: 2 },
  { id: "EVOLVE", name: "進化大師", desc: "完成一次寶可夢進化", icon: "🔄", tier: 2 },
  { id: "PVP_WIN", name: "宿敵剋星", desc: "PvP 對戰獲勝", icon: "🆚", tier: 2 },
  { id: "GYM_32", name: "徽章大師", desc: "收集全部 32 枚徽章", icon: "🏆", tier: 3 },
  { id: "LV_50", name: "大師訓練家", desc: "達到 Lv.50", icon: "👑", tier: 3 },
  { id: "LEAGUE_CHAMP", name: "聯盟王者", desc: "擊敗四天王與冠軍", icon: "🏆", tier: 3 },
  { id: "COLLECTOR_50", name: "大師收藏家", desc: "收集 50 種寶可夢", icon: "💎", tier: 3 },
  { id: "DEX_151", name: "圖鑑達人", desc: "收集全部 151 種寶可夢", icon: "🌟", tier: 3 }
];

const QUESTS = {
  daily: [
    { id: "LOGIN", name: "每日登入", desc: "登入系統並查看儀表板", icon: "🎁", target: 1, rewardExp: 15, rewardCoins: 3 },
    { id: "DAILY_SUBMIT", name: "提交任務", desc: "提交今日學習任務", icon: "📚", target: 1, rewardExp: 40, rewardCoins: 10 },
    { id: "BATTLE_3", name: "對戰練習", desc: "進行 3 場路人戰", icon: "⚔️", target: 3, rewardExp: 30, rewardCoins: 5 },
    { id: "CAPTURE_1", name: "捕捉收集", desc: "捕捉 1 隻寶可夢", icon: "🎯", target: 1, rewardExp: 25, rewardCoins: 5 }
  ],
  weekly: [
    { id: "GYM_3", name: "道館挑戰者", desc: "道館戰獲勝 3 次", icon: "🏛️", target: 3, rewardExp: 150, rewardCoins: 30 },
    { id: "CAPTURE_5", name: "大量捕捉", desc: "捕捉 5 隻寶可夢", icon: "🎯", target: 5, rewardExp: 100, rewardCoins: 25 },
    { id: "BATTLE_10", name: "戰鬥狂人", desc: "進行 10 場戰鬥", icon: "⚔️", target: 10, rewardExp: 80, rewardCoins: 20 },
    { id: "PVP_2", name: "宿敵對決", desc: "PvP 對戰 2 次", icon: "🆚", target: 2, rewardExp: 60, rewardCoins: 15 }
  ]
};

// Build EVO_STAGE_MAP
function buildEvoStageMap() {
  const m = {};
  for (const t in POKEMON_TIERS) {
    for (const e of POKEMON_TIERS[t]) {
      m[e.name] = 0;
      if (e.evolutions) {
        for (let j = 0; j < e.evolutions.length; j++) {
          m[e.evolutions[j]] = j + 1;
        }
      }
    }
  }
  return m;
}
const EVO_STAGE_MAP = buildEvoStageMap();

// =========================================================================
// SECTION 2 — CORE ENGINE FUNCTIONS (mirrors frontend logic)
// =========================================================================

function getExpNeeded(lvl) {
  if (lvl <= 10) return lvl * 30;
  if (lvl <= 20) return lvl * 60;
  if (lvl <= 35) return lvl * 120;
  if (lvl <= 55) return lvl * 200;
  if (lvl <= 75) return lvl * 350;
  if (lvl <= 85) return lvl * 800;
  if (lvl <= 92) return lvl * 2200;
  return lvl * 3000;
}

function calcLevelAndExp(totalExp, initialLevel) {
  let lvl = initialLevel || 5;
  let cur = totalExp;
  let expNeeded = getExpNeeded(lvl);
  while (cur >= expNeeded) {
    cur -= expNeeded;
    lvl++;
    expNeeded = getExpNeeded(lvl);
    if (lvl >= 99) { lvl = 99; cur = 0; expNeeded = 0; break; }
  }
  if (lvl >= 99) { lvl = 99; cur = 0; expNeeded = 0; }
  return { level: lvl, expProgress: cur, expNeeded };
}

function getSeededRandom(seed) {
  // deterministic random based on string seed
  let h = 0;
  for (let i = 0; i < String(seed).length; i++)
    h = String(seed).charCodeAt(i) + ((h << 5) - h);
  const x = Math.sin(h) * 10000;
  return Math.abs(x - Math.floor(x));
}

// Simple seeded PRNG for deterministic simulation
class SeededRNG {
  constructor(seed) {
    this.seed = seed || 42;
    this.state = this.seed;
  }
  next() {
    this.state = (this.state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.state >>> 0) / 4294967296;
  }
  nextInt(max) {
    return Math.floor(this.next() * max);
  }
  nextBool(prob) {
    return this.next() < prob;
  }
}

function getRawName(baseName) {
  return baseName.replace(/^[🐾⭐🌟✨👑]\s*/u, "").replace(/\s*\(.*\)/, "");
}

function checkIsLegendary(pokemonName) {
  const raw = pokemonName.replace(/^[🐾⭐🌟✨]\s*/, "").replace(/\s*\(.*\)/, "");
  for (const t in POKEMON_TIERS) {
    for (const pkmn of POKEMON_TIERS[t]) {
      if (pkmn.name === raw) return pkmn.legendary || false;
    }
  }
  return false;
}

function getPokemonType(baseName) {
  const raw = baseName.replace(/^[🐾⭐🌟✨]\s*/, "").replace(/\s*\(.*\)/, "");
  const types = POKEMON_SPECIES_TYPES[raw];
  if (types) return types.slice();
  const m = baseName.match(/\((.+?)\)/);
  return m ? m[1].split("/") : ["一般"];
}

function getEvoCondition(rawName) {
  return EVO_CONDITIONS[rawName] || null;
}

function getEvoNextName(rawName) {
  for (const t in POKEMON_TIERS) {
    for (const pkmn of POKEMON_TIERS[t]) {
      if (pkmn.name === rawName && pkmn.evolutions) {
        return pkmn.evolutions[0];
      }
      if (pkmn.evolutions) {
        const idx = pkmn.evolutions.indexOf(rawName);
        if (idx !== -1 && idx < pkmn.evolutions.length - 1) {
          return pkmn.evolutions[idx + 1];
        }
      }
    }
  }
  return null;
}

function getHappiness(pkmn) {
  return pkmn.happiness || 0;
}

function getRandomEeveelution() {
  const evos = ["水伊布","雷伊布","火伊布","太陽伊布","月亮伊布","葉伊布","冰伊布","仙子伊布"];
  return evos[Math.floor(Math.random() * evos.length)];
}
function checkEvoReady(pkmn, gd) {
  const raw = getRawName(pkmn.baseName);
  if (!raw) return null;
  if (raw === "伊布") {
    if (pkmn.currentLevel >= 16) return { ready: true, nextName: getRandomEeveelution(), type: "eevee", info: "等級 16+" };
    return null;
  }
  const cond = getEvoCondition(raw);
  let nextName = cond ? cond.to : getEvoNextName(raw);
  if (!nextName) return null;
  if (cond) {
    if (cond.type === "happiness") {
      const h = getHappiness(pkmn);
      if (pkmn.currentLevel < cond.minLevel || h < cond.happiness) return null;
      return { ready: true, nextName: nextName, type: "happiness", info: "親密度 " + h + "/" + cond.happiness };
    }
    if (cond.type === "item") {
      if (pkmn.currentLevel < cond.minLevel) return null;
      if (!gd || !gd[cond.item]) return null;
      return { ready: true, nextName: nextName, type: "item", item: cond.item };
    }
    if (cond.type === "trade") {
      return { ready: true, nextName: nextName, type: "trade" };
    }
  }
  // Check natural evolution
  for (const t in POKEMON_TIERS) {
    for (const pkmnEntry of POKEMON_TIERS[t]) {
      if (pkmnEntry.name === raw && pkmnEntry.evolutions) {
        return { ready: true, nextName: nextName, type: "level", info: "等級進化" };
      }
    }
  }
  return null;
}

// Determine capture tier based on score, badges, and streak
function determineCaptureTier(score, badges, streak) {
  const canLegendary = badges >= 8;
  const fullUnlock = badges >= 16;
  let tier = "一般";
  if (score >= 95) {
    if (fullUnlock) {
      tier = Math.random() < 0.06 ? "傳說" : (Math.random() < 0.6 ? "稀有" : "一般");
    } else if (canLegendary) {
      tier = Math.random() < 0.06 ? "傳說" : (Math.random() < 0.6 ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.6 ? "稀有" : "一般";
    }
  } else if (score >= 75) {
    if (canLegendary) {
      tier = Math.random() < 0.05 ? "傳說" : (Math.random() < 0.35 ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.35 ? "稀有" : "一般";
    }
  } else if (score >= 60) {
    tier = Math.random() < 0.15 ? "稀有" : "一般";
  }
  // Streak bonus (matches frontend)
  if (streak >= 10 && score >= 60) { tier = "傳說"; }
  else if (streak >= 5 && score >= 60 && tier === "一般") { tier = "稀有"; }
  return tier;
}

// =========================================================================
// SECTION 3 — STATE RECONCILIATION ENGINE (replicates frontend recalculateStudentState)
// =========================================================================

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Recalculate student state from events.
 * Mirrors the frontend's recalculateStudentState() logic exactly.
 */
function recalculateState(studentId, events) {
  if (!events || events.length === 0) return null;

  const state = {
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
    hasExpertBelt: false, hasEviolite: false,
    hasChampionCloak: false, hasAmuletCoin: false,
    hasQuickClaw: false, hasFocusLens: false, hasShellBell: false,
    hasLifeOrb: false, hasAssaultVest: false,
    hasFocusSash: false, hasEjectButton: false,
    hasRockyHelmet: false, hasWeaknessPolicy: false,
    oranBerries: 0, cheriBerries: 0, lumBerries: 0, chilanBerries: 0,
    tms: {},
    todayCompleted: false,
    daysSinceLastBadge: 0,
    lastBadgeTime: null,
    firstLogTime: null,
    todayBattles: 0,
    weekGymWins: 0,
    monthLeagueWins: 0,
    happinessToday: {},
    roster: { P0: { id: 'P0', baseName: '🐾 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' } }
  };

  // We use the LAST event's timestamp as "now" for the simulation
  // The simulation generates events in chronological order
  const lastEvent = events[events.length - 1];
  const dNow = new Date(lastEvent.timestamp);
  const todayStr = dNow.toDateString();
  const startOfWeek = getStartOfWeek(dNow).getTime();
  const startOfMonth = getStartOfMonth(dNow).getTime();

  for (const evt of events) {
    const rowDate = new Date(evt.timestamp);
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

    if (!state.submitDates) state.submitDates = {};
    if (!['商城兌換', '戰鬥消耗', '物品消耗', 'E', '系統測試', 'trade', '道具裝備'].includes(rowAction)) {
      state.submitDates[rowDate.toDateString()] = true;
    }

    if (rowDate.toDateString() === todayStr &&
        !['商城兌換', '戰鬥消耗', '物品消耗', 'E', '戰鬥勝利', '系統測試', 'trade', 'PvP'].includes(rowAction)) {
      state.todayCompleted = true;
    }

    // Happiness: daily submit/capture/A => all +1
    if (rowAction === '每日提交' || rowAction === '捕捉' || rowAction === 'A') {
      for (const hid in state.roster) {
        if (!state.happinessToday[hid]) state.happinessToday[hid] = 0;
        state.happinessToday[hid] += 1;
      }
    }
    // Happiness: battle victory => participants +2
    if (rowAction === '戰鬥勝利') {
      const pMatch = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      if (pMatch) {
        const pIds = pMatch[1].split(',').map(s => s.trim());
        for (const pid of pIds) {
          if (pid && state.roster[pid]) {
            if (!state.happinessToday[pid]) state.happinessToday[pid] = 0;
            state.happinessToday[pid] += 2;
          }
        }
      }
    }

    // Shop purchases
    if (rowAction === '商城兌換') {
      const costMatch = safeNote.match(/花費(\d+)幣/);
      if (costMatch) state.coins -= parseInt(costMatch[1]);
      // Items
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
      if (safeNote.includes('橙橙果')) state.oranBerries++;
      if (safeNote.includes('奇異果')) state.cheriBerries++;
      if (safeNote.includes('木子果')) state.lumBerries++;
      if (safeNote.includes('抗性果')) state.chilanBerries++;
      if (safeNote.includes('氣勢披帶')) state.hasFocusSash = true;
      if (safeNote.includes('逃脱按鈕')) state.hasEjectButton = true;
      if (safeNote.includes('凸凸頭盔')) state.hasRockyHelmet = true;
      if (safeNote.includes('弱點保險')) state.hasWeaknessPolicy = true;
      // EVO items
      for (const ei in EVO_ITEMS) {
        if (safeNote.includes(ei)) state[ei] = true;
      }
      const tmMatch = safeNote.match(/TM學習器:\s*(\S+)/);
      if (tmMatch) {
        if (!state.tms) state.tms = {};
        state.tms[tmMatch[1]] = (state.tms[tmMatch[1]] || 0) + 1;
      }
    }

    // Item consumption in battle
    if (rowAction === '戰鬥消耗' || rowAction === '物品消耗') {
      let m;
      if ((m = safeNote.match(/消耗(\d+)瓶好傷藥/))) state.potions -= parseInt(m[1]);
      if ((m = safeNote.match(/消耗(\d+)瓶全滿藥/))) state.maxPotions -= parseInt(m[1]);
      if ((m = safeNote.match(/消耗(\d+)瓶活力塊/))) state.revives -= parseInt(m[1]);
      if ((m = safeNote.match(/消耗(\d+)瓶元氣藥塊/))) state.maxRevives -= parseInt(m[1]);
      if ((m = safeNote.match(/消耗(\d+)瓶神奇糖果/))) state.candies -= parseInt(m[1]);
      if ((m = safeNote.match(/消耗(\d+)個橙橙果/))) state.oranBerries = Math.max(0, (state.oranBerries||0) - parseInt(m[1]));
      if ((m = safeNote.match(/消耗(\d+)個奇異果/))) state.cheriBerries = Math.max(0, (state.cheriBerries||0) - parseInt(m[1]));
      if ((m = safeNote.match(/消耗(\d+)個木子果/))) state.lumBerries = Math.max(0, (state.lumBerries||0) - parseInt(m[1]));
      if ((m = safeNote.match(/消耗(\d+)個抗性果/))) state.chilanBerries = Math.max(0, (state.chilanBerries||0) - parseInt(m[1]));
    }

    // Capture (action A or 捕捉)
    if (rowAction === 'A' || rowAction === '捕捉') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1] || 'legacy_' + evt.id;
      const pNameRaw = ((safeNote.match(/獲得:\s*([^|]+)/) || [])[1] || '未知寶可夢 (一般系)').trim();
      let initLv = Math.min(99, Math.max(5, Math.max(5, state.lockedGymLevel) + (score === 100 ? 3 : (score >= 80 ? 2 : 0))));
      const lvMatch = pNameRaw.match(/(.+?)\s*\(Lv\.(\d+)\)/);
      if (lvMatch) { initLv = parseInt(lvMatch[2], 10); }
      const cleanName = pNameRaw.includes('(') ? pNameRaw : pNameRaw + ' (一般系)';
      if (!state.roster[pid]) {
        state.roster[pid] = {
          id: pid, baseName: cleanName, totalExp: 0, initialLevel: initLv,
          catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`,
          heldItem: ''
        };
      }
    } else if (rowAction === 'B' || rowAction === '糖果升級') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1];
      if (pid) {
        for (const k in state.roster) {
          const isHolder = state.roster[k].heldItem === 'expShare';
          state.roster[k].totalExp += (k === pid || isHolder) ? rowExp : Math.floor(rowExp * 0.5);
        }
      }
    } else if (rowAction === '戰鬥勝利') {
      const match = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      const parts = match ? match[1].split(',').map(s => s.trim()) : [];
      for (const k in state.roster) {
        const isHolder = state.roster[k].heldItem === 'expShare';
        state.roster[k].totalExp += (parts.includes(k) || isHolder) ? rowExp : Math.floor(rowExp * 0.5);
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
      if (isRowThisMonth && (safeNote.includes('[League]') || safeNote.includes('大會') || safeNote.includes('魔王'))) state.monthLeagueWins++;
    } else if (rowAction === 'E') {
      const nm = safeNote.match(/獲得:\s*([^|]+)/);
      if (nm && state.roster['P0']) {
        state.roster['P0'].baseName = nm[1].trim();
      }
      const evoMatch = safeNote.match(/進化ID:(\S+)\s*=>\s*(.+)/);
      if (evoMatch && state.roster[evoMatch[1]]) {
        state.roster[evoMatch[1]].baseName = evoMatch[2].trim();
      }
    } else if (rowAction === '滿級轉化') {
      state.coins += rowCoins;
    }

    // Recalculate highest level after each event
    let currentIterLevel = 5;
    for (const k in state.roster) {
      const lvlInfo = calcLevelAndExp(state.roster[k].totalExp, state.roster[k].initialLevel);
      if (lvlInfo.level > currentIterLevel) currentIterLevel = lvlInfo.level;
    }
    state.highestLevel = currentIterLevel;
    if (rowBadges > 0) state.lockedGymLevel = state.highestLevel;
  }

  state.daysSinceLastBadge = state.lastBadgeTime
    ? (dNow.getTime() - state.lastBadgeTime) / 86400000
    : (state.firstLogTime ? (dNow.getTime() - state.firstLogTime) / 86400000 : 0);

  // MIN 補償：長期提交但少戰鬥的玩家自動獲得徽章
  const totalSubmitDays = state.submitDates ? Object.keys(state.submitDates).length : 0;
  if (totalSubmitDays >= 60) state.badges += 5;
  else if (totalSubmitDays >= 30) state.badges += 2;

  const rosterArray = [];
  let finalHighestLevel = 5;
  for (const k in state.roster) {
    const p = state.roster[k];
    const lvlInfo = calcLevelAndExp(p.totalExp, p.initialLevel);
    p.currentLevel = lvlInfo.level;
    p.expProgress = lvlInfo.expProgress;
    p.expNeeded = lvlInfo.expNeeded;
    // merge happiness
    if (state.happinessToday && state.happinessToday[p.id]) {
      p.happiness = (p.happiness || 0) + state.happinessToday[p.id];
    } else {
      p.happiness = p.happiness || 0;
    }
    // Auto-evolve during replay
    const evoInfo2 = checkEvoReady(p, null);
    if (evoInfo2 && evoInfo2.nextName) {
      const types2 = POKEMON_SPECIES_TYPES[evoInfo2.nextName] || ["一般"];
      const m2 = p.baseName.match(/^[🐾⭐🌟✨👑]\s*/);
      p.baseName = (m2 ? m2[0] : "⭐ ") + evoInfo2.nextName + " (" + types2.join("/") + ")";
    }
    if (p.currentLevel > finalHighestLevel) finalHighestLevel = p.currentLevel;
    rosterArray.push(p);
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
    hasFocusSash: state.hasFocusSash || false,
    hasEjectButton: state.hasEjectButton || false,
    hasRockyHelmet: state.hasRockyHelmet || false,
    hasWeaknessPolicy: state.hasWeaknessPolicy || false,
    oranBerries: state.oranBerries || 0,
    cheriBerries: state.cheriBerries || 0,
    lumBerries: state.lumBerries || 0,
    chilanBerries: state.chilanBerries || 0,
    tms: state.tms || {},
    todayCompleted: state.todayCompleted,
    daysSinceLastBadge: state.daysSinceLastBadge,
    roster: rosterArray,
    todayBattles: state.todayBattles,
    weekGymWins: state.weekGymWins,
    monthLeagueWins: state.monthLeagueWins
  };
}

// =========================================================================
// SECTION 4 — SIMULATION ENGINE
// =========================================================================

class SimulationStudent {
  constructor(name, dailyScore) {
    this.name = name;
    this.dailyScore = dailyScore; // 100 for max, 60 for min
    this.events = [];
    this.studentId = name;
    this.rng = new SeededRNG(name.charCodeAt(0) * 1000);
    this.pokemonIdCounter = 1;
    this.rosterSnapshot = null;
    this.captureLog = []; // track captures for report
    this.battleLog = [];
    this.gymAttempts = 0;
    this.gymWins = 0;
    this.leagueAttempts = 0;
    this.leagueWins = 0;
    this.itemPurchases = [];
    this.achievementChecks = new Set();
    this.evolutionCount = 0;
    this.caughtByTier = { '一般': 0, '稀有': 0, '傳說': 0 };
    this.uniqueSpecies = new Set();
    this._lastBadgeTime = null;
  }

  nextPokemonId() {
    return 'P' + (this.pokemonIdCounter++);
  }

  /**
   * Simulate one day of activity.
   * Mode cycles: normal submit, capture, train
   */
  simulateDay(dayNumber, month, isLeaguePeriod) {
    const timestamp = new Date(2026, month - 1 + 3, dayNumber, 8, 0, 0); // Starting from Apr 2026
    const dateStr = timestamp.toISOString();
    const mode = dayNumber % 3; // 0=normal, 1=capture, 2=train
    const score = this.dailyScore;

    // Determine league/month-end multiplier
    const isLast3Days = dayNumber >= 28;
    const multiplier = (isLast3Days && isLeaguePeriod) ? 2 : 1;
    const finalScore = score * multiplier;

    // Compute badges from state
    let currentState = recalculateState(this.studentId, this.events);
    const badges = currentState ? currentState.badges : 0;
    const streak = currentState ? currentState.streak : 0;

    // --- ACTION: Normal submit / Capture / Train ---
    if (mode === 1 && score >= 50) {
      // CAPTURE ACTION
      const tier = determineCaptureTier(finalScore, badges, streak);
      let captureLevel;
      if (finalScore >= 95) captureLevel = Math.floor(finalScore / 4);
      else if (finalScore >= 75) captureLevel = Math.floor(finalScore / 6);
      else captureLevel = Math.floor(finalScore / 8);
      captureLevel = Math.max(5, captureLevel);
      const rawCapture = this._generateCapture(tier, '隨機', captureLevel);
      const expGain = Math.floor(finalScore * 5);
      const coinsGain = Math.floor(finalScore * 1.5);
      const note = `捕捉: ${rawCapture.name} | ID:${rawCapture.id}`;
      this.events.push({
        studentId: this.studentId, timestamp, score: finalScore, action: '捕捉',
        expGained: expGain, coinsGained: coinsGain, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
      this._logCapture(rawCapture);
    } else if (mode === 2) {
      // TRAIN ACTION — boost a specific pokemon
      const expGain = finalScore * 6;
      const coinsGain = Math.floor(finalScore * 1.5);
      const targetId = currentState && currentState.roster && currentState.roster.length > 0
        ? currentState.roster[0].id : 'P0';
      const targetName = currentState && currentState.roster && currentState.roster.length > 0
        ? currentState.roster[0].baseName : '伊布';
      const note = `強化: ${targetName} | 集中訓練 +${expGain} EXP | ID:${targetId}`;
      this.events.push({
        studentId: this.studentId, timestamp, score: finalScore, action: '糖果升級',
        expGained: expGain, coinsGained: coinsGain, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
    } else {
      // NORMAL SUBMIT
      const expGain = finalScore * 6;
      const coinsGain = finalScore * 2;
      const note = `每日提交: 分數 ${finalScore}`;
      this.events.push({
        studentId: this.studentId, timestamp, score: finalScore, action: '每日提交',
        expGained: expGain, coinsGained: coinsGain, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
    }

    // --- BATTLE: Wild encounter every day ---
    this._simulateWildBattle(timestamp, currentState);

    // --- GYM BATTLE: Attempt on days 7, 14, 21 (once a week) ---
    if (dayNumber % 7 === 0) {
      this._simulateGymBattle(timestamp);
    }

    // --- LEAGUE: On last 3 days ---
    if (isLast3Days && isLeaguePeriod) {
      this._simulateLeagueBattle(timestamp);
    }

    // --- SHOP: Purchase items periodically ---
    if (dayNumber % 10 === 0) {
      this._simulateShopping(timestamp);
    }
  }

  _generateCapture(tier, targetType, level) {
    const pool = POKEMON_TIERS[tier] || POKEMON_TIERS['一般'];
    const candidates = [];
    for (const s of pool) {
      let evoName = s.name;
      if (s.evolutions) {
        const evoI = Math.min(Math.floor(level / 15), s.evolutions.length - 1);
        evoName = s.evolutions[evoI];
      }
      if (targetType === '隨機') { candidates.push(evoName); continue; }
      const speciesT = POKEMON_SPECIES_TYPES[evoName] || ['一般'];
      if (speciesT.includes(targetType)) candidates.push(evoName);
    }
    const chosenName = candidates.length > 0
      ? candidates[this.rng.nextInt(candidates.length)]
      : pool[this.rng.nextInt(pool.length)].name;
    const types = POKEMON_SPECIES_TYPES[chosenName] || ['一般'];
    const isLeg = checkIsLegendary(chosenName);
    const prefix = isLeg ? '✨ ' : '⭐ ';
    return {
      name: prefix + chosenName + ' (' + types.join('/') + ')',
      id: this.nextPokemonId(),
      level,
      types,
      isLegendary: isLeg,
      rawName: chosenName,
      tier
    };
  }

  _logCapture(capture) {
    this.caughtByTier[capture.tier] = (this.caughtByTier[capture.tier] || 0) + 1;
    this.uniqueSpecies.add(capture.rawName);
  }

  _simulateWildBattle(timestamp, currentState) {
    const playerLevel = currentState ? currentState.highestLevel : 5;
    // Wild encounter — simplified exp calculation
    const baseExp = 80 + Math.floor(playerLevel * 3);
    const legBonus = 1; // simplified
    const expGain = Math.floor(baseExp * 1.2); // participant bonus for lead
    const coinsGain = 5 + Math.floor(playerLevel * 0.5);
    const note = `戰鬥勝利 | 對手: 野生寶可夢 [路人] | 參與者: P0`;
    this.events.push({
      studentId: this.studentId, timestamp, score: 0, action: '戰鬥勝利',
      expGained: expGain, coinsGained: coinsGain, badgeChange: 0,
      tasks: [], note, extraNote: note
    });
  }

  _simulateGymBattle(timestamp) {
    // Simplified: assume player wins gym if they have appropriate badges
    let currentState = recalculateState(this.studentId, this.events);
    const level = currentState ? currentState.highestLevel : 5;
    const badges = currentState ? currentState.badges : 0;
    const daysSinceBadge = currentState ? currentState.daysSinceLastBadge : 99;

    // Find current gym leader
    const gymIndex = Math.min(badges, GYM_LEADERS.length - 1);
    const gym = GYM_LEADERS[gymIndex];
    this.gymAttempts++;

    // Gym cool-down check: must wait 1 day since last badge
    if (daysSinceBadge < 1) {
      // Still on cooldown — skip
      return;
    }

    // Determine if player can win: level must be >= gym level requirement
    const requiredLevel = 5 + gym.lvBonus;
    const canWin = level >= requiredLevel;

    if (canWin) {
      // WIN!
      this.gymWins++;
      // Calculate exp: gym reward
      const totalWaves = gym.waves;
      let cumulativeExp = 0;
      for (let wi = 0; wi < totalWaves; wi++) {
        const isLast = (wi === totalWaves - 1);
        const waveLvBonus = isLast ? gym.lvBonus : Math.floor(gym.lvBonus * 0.4);
        const waveLevel = Math.max(5, level + waveLvBonus);
        let baseExp = 80 + Math.floor(waveLevel * 3);
        const waveMult = isLast ? 2.5 : 1.2;
        baseExp = Math.floor(baseExp * 1.8 * waveMult);
        cumulativeExp += baseExp;
      }
      const totalExpGain = Math.floor(cumulativeExp);
      const coinsGain = 15 + Math.floor(level * 0.8);
      const badgeGain = (gym.badge === badges + 1) ? 1 : 0;
      const note = `道館勝利 | 館主: ${gym.leader} (${gym.name}) [Gym] | 波次:${gym.waves} | 參與者: P0`;
      this.events.push({
        studentId: this.studentId, timestamp, score: 0, action: '戰鬥勝利',
        expGained: totalExpGain, coinsGained: coinsGain,
        badgeChange: badgeGain, tasks: [], note, extraNote: note
      });
      if (badgeGain > 0) this._lastBadgeTime = timestamp;
    }
    // Else: lose, no event recorded
  }

  _simulateLeagueBattle(timestamp) {
    let currentState = recalculateState(this.studentId, this.events);
    const badges = currentState ? currentState.badges : 0;
    const level = currentState ? currentState.highestLevel : 5;
    this.leagueAttempts++;

    // Find eligible league regions
    const eligibleRegions = [];
    for (const [regionName, region] of Object.entries(LEAGUE_REGIONS)) {
      if (badges >= region.requiredBadges) {
        eligibleRegions.push(regionName);
      }
    }
    if (eligibleRegions.length === 0) return;

    // Try the first eligible region
    const regionName = eligibleRegions[0];
    const region = LEAGUE_REGIONS[regionName];
    const champ = region.champion;

    // Simplified: win if level >= champ.lvBonus - 10
    const requiredLevel = champ.lvBonus - 10;
    const canWin = level >= requiredLevel;

    if (canWin) {
      this.leagueWins++;
      // League reward calculation
      let cumulativeExp = 0;
      for (const e4 of region.eliteFour) {
        let baseExp = 80 + Math.floor((level + e4.lvBonus) * 3);
        baseExp = Math.floor(baseExp * 5 * 2.5);
        cumulativeExp += baseExp;
      }
      // Champion wave
      let champExp = 80 + Math.floor((level + champ.lvBonus) * 3);
      champExp = Math.floor(champExp * 5 * 4);
      cumulativeExp += champExp;
      cumulativeExp = Math.floor(cumulativeExp);
      const totalExpGain = Math.floor(cumulativeExp * 1.2); // lead bonus
      const coinsGain = 80 + Math.floor(level * 1.5);
      const note = `聯盟冠軍 [${regionName} League] | 四天王+冠軍 [${champ.name}] | 參與者: P0`;
      this.events.push({
        studentId: this.studentId, timestamp, score: 0, action: '戰鬥勝利',
        expGained: totalExpGain, coinsGained: coinsGain,
        badgeChange: 0, tasks: [], note, extraNote: note
      });
    }
  }

  _simulateShopping(timestamp) {
    let currentState = recalculateState(this.studentId, this.events);
    const coins = currentState ? currentState.coins : 0;

    // Buy potions and candies if affordable
    if (coins >= 15) {
      const note = `花費15幣購買 好傷藥`;
      this.events.push({
        studentId: this.studentId, timestamp, score: 0, action: '商城兌換',
        expGained: 0, coinsGained: -15, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
      this.itemPurchases.push({ item: '好傷藥', cost: 15 });
    }
    if (coins >= 25) {
      const note = `花費25幣購買 神奇糖果`;
      this.events.push({
        studentId: this.studentId, timestamp, score: 0, action: '商城兌換',
        expGained: 0, coinsGained: -25, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
      this.itemPurchases.push({ item: '神奇糖果', cost: 25 });
    }
    // Buy key items like expShare once affordable
    if (coins >= 80 && currentState && !currentState.expSharePurchased) {
      const note = `花費80幣購買 學習裝置`;
      this.events.push({
        studentId: this.studentId, timestamp, score: 0, action: '商城兌換',
        expGained: 0, coinsGained: -80, badgeChange: 0,
        tasks: [], note, extraNote: note
      });
      this.itemPurchases.push({ item: '學習裝置', cost: 80 });
    }
  }

  /** Return current state */
  getState() {
    return recalculateState(this.studentId, this.events);
  }

  /** Get monthly snapshot */
  getMonthlyReport(month) {
    const state = this.getState();
    if (!state) return null;

    const uniqueTypes = new Set();
    for (const p of state.roster) {
      const types = getPokemonType(p.baseName);
      for (const t of types) uniqueTypes.add(t);
    }

    return {
      month,
      level: state.highestLevel,
      coins: state.coins,
      badges: state.badges,
      rosterCount: state.roster.length,
      uniqueSpecies: this.uniqueSpecies.size,
      evolutions: this.evolutionCount,
      caughtByTier: { ...this.caughtByTier },
      gymAttempts: this.gymAttempts,
      gymWins: this.gymWins,
      leagueAttempts: this.leagueAttempts,
      leagueWins: this.leagueWins,
      itemPurchases: this.itemPurchases.length,
      totalExp: state.roster.reduce((sum, p) => sum + p.totalExp, 0),
      hasExpShare: state.expSharePurchased,
      uniqueTypes: uniqueTypes.size,
      topPkmn: state.roster.length > 0
        ? state.roster.reduce((a, b) => a.currentLevel > b.currentLevel ? a : b).baseName
        : '無',
      topLevel: state.roster.length > 0
        ? state.roster.reduce((a, b) => a.currentLevel > b.currentLevel ? a : b).currentLevel
        : 0
    };
  }
}

// =========================================================================
// SECTION 5 — BUG CHECKERS
// =========================================================================

/**
 * M1: EXP Curve Analysis
 * Checks if leveling feels right across 9 months
 */
function checkExpCurve(studentReports, name) {
  const issues = [];
  const first = studentReports[0];
  const last = studentReports[studentReports.length - 1];

  if (!first || !last) return { status: 'SKIP', details: 'No data' };

  const startLevel = first.level;
  const endLevel = last.level;

  // Level 5-10: need 30/level => total 5*30+6*30+... (5 to 10 = levels 5,6,7,8,9)
  // Let's check if projection is reasonable
  if (name === 'max') {
    if (endLevel < 30) {
      issues.push(`WARNING: Max student only reached Lv.${endLevel} after 9 months (expected 50+)`);
    } else if (endLevel < 50) {
      issues.push(`NOTE: Max student reached Lv.${endLevel} after 9 months (target: 50+)`);
    }
    if (endLevel > 80) {
      issues.push(`NOTE: Max student reached Lv.${endLevel} — very fast progression`);
    }
  } else {
    if (endLevel < 15) {
      issues.push(`WARNING: Min student only reached Lv.${endLevel} after 9 months (expected 20+)`);
    }
  }

  // Check level progression smoothness
  let prevLevel = startLevel;
  for (let i = 1; i < studentReports.length; i++) {
    const report = studentReports[i];
    if (report.level < prevLevel) {
      issues.push(`BUG: Level decreased from ${prevLevel} to ${report.level} at month ${report.month}`);
    }
    prevLevel = report.level;
  }

  return {
    status: issues.length > 0 ? 'ISSUES_FOUND' : 'OK',
    startLevel,
    endLevel,
    issues,
    totalGained: endLevel - startLevel
  };
}

/**
 * M2: Capture Rate Analysis — legendary frequency
 */
function checkCaptureRate(student, name) {
  const issues = [];
  const total = student.caughtByTier['一般'] + student.caughtByTier['稀有'] + student.caughtByTier['傳說'];
  const legendaries = student.caughtByTier['傳說'] || 0;

  if (total === 0) return { status: 'SKIP', details: 'No captures' };

  const legPct = (legendaries / total * 100).toFixed(1);

  if (name === 'max' && legPct > 5) {
    issues.push(`BUG: Max student caught ${legendaries}/${total} legendaries (${legPct}%) — expected <5% for 95+ scores`);
  }
  if (legPct > 15) {
    issues.push(`BUG: Very high legendary rate ${legPct}% — check capture tier logic`);
  }

  return {
    status: issues.length > 0 ? 'ISSUES_FOUND' : 'OK',
    totalCaptures: total,
    byTier: { ...student.caughtByTier },
    legendaryPct: legPct + '%',
    issues
  };
}

/**
 * M4: Gym difficulty curve
 */
function checkGymCurve(student, name) {
  const issues = [];
  const state = student.getState();
  const badges = state ? state.badges : 0;

  // Check badge rates
  if (name === 'max' && badges < 8) {
    issues.push(`BUG: Max student only has ${badges} badges after 9 months (expected 32+)`);
  }
  if (name === 'min' && badges < 4) {
    issues.push(`NOTE: Min student only has ${badges} badges — gym curve may be too steep`);
  }

  // Check if gym progression was blocked
  const gymWins = student.gymWins;
  const gymAttempts = student.gymAttempts;
  if (gymAttempts > 0) {
    const gymWinRate = (gymWins / gymAttempts * 100).toFixed(1);
    if (name === 'max' && gymWinRate < '80') {
      issues.push(`NOTE: Max student gym win rate is ${gymWinRate}% — examine difficulty`);
    }
    if (name === 'min' && gymWinRate < '30') {
      issues.push(`NOTE: Min student gym win rate is ${gymWinRate}% — may be too hard`);
    }
  }

  return {
    status: issues.length > 0 ? 'ISSUES_FOUND' : 'OK',
    badges,
    gymWins,
    gymAttempts,
    highestLevel: state ? state.highestLevel : 0,
    badgeThreshold: name === 'max' ? '>=8' : '>=4',
    issues
  };
}

/**
 * M6: Item economy
 */
function checkItemEconomy(reports, name) {
  const issues = [];
  if (reports.length === 0) return { status: 'SKIP', details: 'No data' };

  const last = reports[reports.length - 1];

  if (name === 'max' && last.coins < 200) {
    issues.push(`NOTE: Max student ended with only ${last.coins} coins after 9 months — check item prices vs income`);
  }
  if (name === 'min' && last.coins < 50) {
    issues.push(`WARNING: Min student ended with only ${last.coins} coins — economy may be too tight`);
  }

  // Check coin progression
  let maxCoinMonth = 0;
  for (const r of reports) {
    if (r.coins > maxCoinMonth) maxCoinMonth = r.coins;
  }

  return {
    status: issues.length > 0 ? 'ISSUES_FOUND' : 'OK',
    finalCoins: last.coins,
    maxCoins: maxCoinMonth,
    issues
  };
}

/**
 * M7: Achievement progression check
 */
function checkAchievements(reports, name) {
  const issues = [];
  const last = reports[reports.length - 1];
  if (!last) return { status: 'SKIP', details: 'No data' };

  // Check if achievements would have been earned by these thresholds
  if (name === 'max') {
    if (last.level >= 10) issues.push(`INFO: LV_10 achievement should be earned (Lv.${last.level})`);
    if (last.badges >= 8) issues.push(`INFO: GYM_8 achievement should be earned (${last.badges} badges)`);
    if (last.level >= 25) issues.push(`INFO: LV_25 achievement should be earned (Lv.${last.level})`);
    if (last.badges >= 32) issues.push(`INFO: GYM_32 achievement should be earned (${last.badges} badges)`);
    if (last.level >= 50) issues.push(`INFO: LV_50 achievement should be earned (Lv.${last.level})`);
    if (last.rosterCount >= 10) issues.push(`INFO: COLLECTOR_10 should be earned (${last.rosterCount} pokemon)`);
  }

  return {
    status: 'INFO',
    potentialAchievements: issues,
    issues
  };
}

// =========================================================================
// SECTION 6 — MAIN SIMULATION LOOP
// =========================================================================

function runSimulation() {
  console.log('='.repeat(72));
  console.log('  學習 KPI 管理系統 — 9 個月模擬測試');
  console.log('  teacher-toolkit simulation-test.js');
  console.log('='.repeat(72));
  console.log('');

  const maxStudent = new SimulationStudent('max', 100);
  const minStudent = new SimulationStudent('min', 60);
  const TOTAL_MONTHS = 9;
  const DAYS_PER_MONTH = 30;

  const maxReports = [];
  const minReports = [];
  const errors = [];
  const bugsFound = [];

  // Run simulation month by month
  for (let month = 1; month <= TOTAL_MONTHS; month++) {
    console.log(`\n--- Month ${month} / ${TOTAL_MONTHS} ---`);

    for (let day = 1; day <= DAYS_PER_MONTH; day++) {
      const isLeaguePeriod = (month >= 3); // League available from month 3 onwards

      try {
        maxStudent.simulateDay(day, month, isLeaguePeriod);
        minStudent.simulateDay(day, month, isLeaguePeriod);
      } catch (err) {
        errors.push({ month, day, student: 'both', error: err.message });
        console.error(`  ERROR day ${day}: ${err.message}`);
      }
    }

    // Record monthly reports
    const maxReport = maxStudent.getMonthlyReport(month);
    const minReport = minStudent.getMonthlyReport(month);
    if (maxReport) maxReports.push(maxReport);
    if (minReport) minReports.push(minReport);

    // Print summary
    if (maxReport) {
      console.log(`  MAX  → Lv.${maxReport.level} | ${maxReport.badges} badges | ${maxReport.rosterCount} pkmn | ${maxReport.coins} coins`);
    }
    if (minReport) {
      console.log(`  MIN  → Lv.${minReport.level} | ${minReport.badges} badges | ${minReport.rosterCount} pkmn | ${minReport.coins} coins`);
    }
  }

  // =========================================================================
  // SECTION 7 — BUG & BALANCE ANALYSIS
  // =========================================================================

  console.log('\n' + '='.repeat(72));
  console.log('  ANALYSIS REPORT');
  console.log('='.repeat(72));

  // --- M1: EXP Curve ---
  console.log('\n--- M1: EXP Curve Analysis ---');
  const maxExpCheck = checkExpCurve(maxReports, 'max');
  const minExpCheck = checkExpCurve(minReports, 'min');
  printCheck('MAX', maxExpCheck);
  printCheck('MIN', minExpCheck);
  if (maxExpCheck.issues.length > 0) bugsFound.push({ issue: 'M1-EXP_CURVE', student: 'max', details: maxExpCheck.issues.join('; ') });
  if (minExpCheck.issues.length > 0) bugsFound.push({ issue: 'M1-EXP_CURVE', student: 'min', details: minExpCheck.issues.join('; ') });

  // --- M2: Capture Rate ---
  console.log('\n--- M2: Capture Rate Analysis ---');
  const maxCapture = checkCaptureRate(maxStudent, 'max');
  const minCapture = checkCaptureRate(minStudent, 'min');
  printCheck('MAX', maxCapture);
  printCheck('MIN', minCapture);
  if (maxCapture.issues.length > 0) bugsFound.push({ issue: 'M2-CAPTURE_RATE', student: 'max', details: maxCapture.issues.join('; ') });
  if (minCapture.issues.length > 0) bugsFound.push({ issue: 'M2-CAPTURE_RATE', student: 'min', details: minCapture.issues.join('; ') });

  // --- M3: Evolution Timing ---
  console.log('\n--- M3: Evolution Timing Check ---');
  const maxState = maxStudent.getState();
  const minState = minStudent.getState();
  if (maxState) {
    const eevee = maxState.roster.find(p => p.id === 'P0');
    if (eevee) {
      console.log(`  MAX Eevee: Lv.${eevee.currentLevel} | name: ${eevee.baseName}`);
      if (eevee.currentLevel >= 16 && getRawName(eevee.baseName) === '伊布') {
        bugsFound.push({ issue: 'M3-EVOLVE_EEVEE', student: 'max', details: `Eevee reached Lv.${eevee.currentLevel} but still base form — evolution dialog may be missed` });
      }
    }
  }
  if (minState) {
    const eevee = minState.roster.find(p => p.id === 'P0');
    if (eevee) {
      console.log(`  MIN Eevee: Lv.${eevee.currentLevel} | name: ${eevee.baseName}`);
    }
  }

  // --- M4: Gym Difficulty ---
  console.log('\n--- M4: Gym Difficulty Curve ---');
  const maxGym = checkGymCurve(maxStudent, 'max');
  const minGym = checkGymCurve(minStudent, 'min');
  printCheck('MAX', maxGym);
  printCheck('MIN', minGym);
  if (maxGym.issues.length > 0) bugsFound.push({ issue: 'M4-GYM_CURVE', student: 'max', details: maxGym.issues.join('; ') });
  if (minGym.issues.length > 0) bugsFound.push({ issue: 'M4-GYM_CURVE', student: 'min', details: minGym.issues.join('; ') });

  // --- M5: League Region Unlock ---
  console.log('\n--- M5: League Region Unlock ---');
  console.log(`  MAX: ${maxStudent.leagueAttempts} attempts, ${maxStudent.leagueWins} wins`);
  console.log(`  MIN: ${minStudent.leagueAttempts} attempts, ${minStudent.leagueWins} wins`);
  if (maxStudent.leagueWins === 0 && maxGym.badges >= 8) {
    bugsFound.push({ issue: 'M5-LEAGUE_UNLOCK', student: 'max', details: 'Has 8+ badges but 0 league wins — league access may be blocked' });
  }

  // --- M6: Item Economy ---
  console.log('\n--- M6: Item Economy ---');
  const maxEcon = checkItemEconomy(maxReports, 'max');
  const minEcon = checkItemEconomy(minReports, 'min');
  printCheck('MAX', maxEcon);
  printCheck('MIN', minEcon);
  if (maxEcon.issues.length > 0) bugsFound.push({ issue: 'M6-ECONOMY', student: 'max', details: maxEcon.issues.join('; ') });
  if (minEcon.issues.length > 0) bugsFound.push({ issue: 'M6-ECONOMY', student: 'min', details: minEcon.issues.join('; ') });

  // --- M7: Achievement Progression ---
  console.log('\n--- M7: Achievement Progression ---');
  const maxAch = checkAchievements(maxReports, 'max');
  const minAch = checkAchievements(minReports, 'min');
  printCheck('MAX', maxAch);
  printCheck('MIN', minAch);

  // =========================================================================
  // SECTION 8 — SUMMARY
  // =========================================================================

  console.log('\n' + '='.repeat(72));
  console.log('  FINAL SUMMARY');
  console.log('='.repeat(72));

  console.log('\n【MAX Student — perfect score 100% daily】');
  if (maxReports.length > 0) {
    const last = maxReports[maxReports.length - 1];
    console.log(`  Final Level:      Lv.${last.level}`);
    console.log(`  Pokémon Owned:    ${last.rosterCount} (${last.uniqueSpecies} unique species)`);
    console.log(`  Badges Earned:    ${last.badges}/16`);
    console.log(`  Total Coins:      ${last.coins}`);
    console.log(`  Gym Wins:         ${maxStudent.gymWins}/${maxStudent.gymAttempts} attempts`);
    console.log(`  League Wins:      ${maxStudent.leagueWins}/${maxStudent.leagueAttempts} attempts`);
    console.log(`  Captures:         ${maxStudent.caughtByTier['一般']} common + ${maxStudent.caughtByTier['稀有']} rare + ${maxStudent.caughtByTier['傳說']} legendary`);
    console.log(`  Top Pokémon:      ${last.topPkmn} (Lv.${last.topLevel})`);
    console.log(`  Items Purchased:  ${maxStudent.itemPurchases.length}`);
  }

  console.log('\n【MIN Student — minimum score 60% daily】');
  if (minReports.length > 0) {
    const last = minReports[minReports.length - 1];
    console.log(`  Final Level:      Lv.${last.level}`);
    console.log(`  Pokémon Owned:    ${last.rosterCount} (${last.uniqueSpecies} unique species)`);
    console.log(`  Badges Earned:    ${last.badges}/16`);
    console.log(`  Total Coins:      ${last.coins}`);
    console.log(`  Gym Wins:         ${minStudent.gymWins}/${minStudent.gymAttempts} attempts`);
    console.log(`  League Wins:      ${minStudent.leagueWins}/${minStudent.leagueAttempts} attempts`);
    console.log(`  Captures:         ${minStudent.caughtByTier['一般']} common + ${minStudent.caughtByTier['稀有']} rare + ${minStudent.caughtByTier['傳說']} legendary`);
    console.log(`  Top Pokémon:      ${last.topPkmn} (Lv.${last.topLevel})`);
  }

  // Monthly progression table
  console.log('\n【Monthly Progression】');
  console.log('  Month | MAX Lv | MAX Badges | MIN Lv | MIN Badges');
  console.log('  ' + '-'.repeat(47));
  for (let i = 0; i < Math.max(maxReports.length, minReports.length); i++) {
    const mr = maxReports[i] || { month: i+1, level: '?', badges: '?' };
    const mir = minReports[i] || { month: i+1, level: '?', badges: '?' };
    console.log(`  M${mr.month.toString().padStart(2)}   | ${String(mr.level).padStart(5)}  | ${String(mr.badges).padStart(9)}  | ${String(mir.level).padStart(5)}  | ${String(mir.badges).padStart(9)}`);
  }

  // Bugs found
  console.log('\n【Bugs & Issues Found】');
  if (bugsFound.length === 0) {
    console.log('  ✅ No bugs detected in simulation');
  } else {
    for (const bug of bugsFound) {
      console.log(`  🔴 [${bug.issue}] ${bug.student}: ${bug.details}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n【Runtime Errors】 ${errors.length} total`);
    for (const err of errors.slice(0, 10)) {
      console.log(`  ⚠️  M${err.month} D${err.day}: ${err.error}`);
    }
  }

  console.log('\n' + '='.repeat(72));
  console.log('  Simulation complete.');
  console.log('='.repeat(72));
}

function printCheck(label, result) {
  if (result.status === 'OK') {
    console.log(`  ${label}: ✅ OK`);
  } else if (result.status === 'ISSUES_FOUND') {
    console.log(`  ${label}: 🔴 Issues Found`);
    for (const issue of result.issues) {
      console.log(`         ${issue}`);
    }
  } else if (result.status === 'INFO') {
    console.log(`  ${label}: ℹ️  Info`);
    for (const issue of result.issues) {
      console.log(`         ${issue}`);
    }
  } else {
    console.log(`  ${label}: ⏭️  ${result.details}`);
  }
}

// =========================================================================
// SECTION 9 — RUN
// =========================================================================

runSimulation();
