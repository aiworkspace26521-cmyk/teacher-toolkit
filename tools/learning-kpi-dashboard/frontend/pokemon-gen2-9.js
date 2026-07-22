// Gen2~Gen9 Pokemon, Moves, Types Extension
// Load AFTER kpi-dashboard.html inline script
(function(){
// ========== POKEMON_TIERS EXTENSION ==========
var addCommon = [
  // Gen2 城都
  {name:"戴魯比",evolutions:["黑魯加"]},{name:"布撥",evolutions:["布土撥","巴布土撥"]},
  {name:"豆蟋蟀",evolutions:["烈腿蝗"]},{name:"電海燕",evolutions:["大電海燕"]},
  {name:"小箭雀",evolutions:["火箭雀","烈箭鷹"]},{name:"掘掘兔",evolutions:["掘地兔"]},
  {name:"圖圖犬"},{name:"大奶罐"},{name:"幸福蛋"},{name:"百變怪"},{name:"雷精靈"},
  {name:"水精靈"},{name:"火精靈"},{name:"太陽精靈"},{name:"月亮精靈"},{name:"葉精靈"},
  {name:"冰精靈"},{name:"仙子精靈"},{name:"樹才怪"},{name:"果然翁"},{name:"麒麟奇"},
  {name:"榛果球",evolutions:["佛烈托斯"]},{name:"壺壺"},{name:"土龍弟弟"},{name:"布魯",evolutions:["布魯皇"]},
  {name:"千針魚",evolutions:["萬針魚"]},{name:"太陽珊瑚"},{name:"鐵炮魚",evolutions:["章魚桶"]},{name:"信使鳥"},
  {name:"巨翅飛魚"},{name:"驚角鹿",evolutions:["詭角鹿"]},{name:"巴爾郎",evolutions:["沙瓦郎","艾比郎","柯波朗"]},
  {name:"牛蛙君"},{name:"赫拉克羅斯"},{name:"狃拉",evolutions:["瑪狃拉","大狃拉"]},{name:"熊寶寶",evolutions:["圈圈熊"]},
  {name:"小山豬",evolutions:["長毛豬","象牙豬"]},{name:"小小象",evolutions:["頓甲"]},
  {name:"咩利羊",evolutions:["茸茸羊","電龍"]},{name:"烏波",evolutions:["沼王"]},
  {name:"天然雀",evolutions:["天然鳥"]},{name:"呆呆魚",evolutions:["呆呆王"]},
  {name:"小鴨嘴火龍",evolutions:["鴨嘴火獸","鴨嘴炎獸"]},{name:"電擊怪",evolutions:["電擊獸","電擊魔獸"]},
  {name:"溶食獸",evolutions:["吞食獸"]},{name:"吼爆彈",evolutions:["爆音怪"]},
  {name:"向尾喵",evolutions:["優雅貓"]},{name:"幕下力士",evolutions:["鐵掌力士"]},
  {name:"刺尾蟲",evolutions:["甲殼蛹","狩獵鳳蝶"]},{name:"盾甲繭",evolutions:["毒粉蛾"]},
  {name:"橡實果",evolutions:["長鼻葉","狡猾天狗"]},{name:"蓮葉童子",evolutions:["蓮帽小童","樂天河童"]},
  {name:"龍蝦小兵",evolutions:["鐵螯龍蝦"]},{name:"駒刀小兵",evolutions:["劈斬司令","仆斬將軍"]},
  {name:"好啦魷",evolutions:["烏賊王"]},{name:"呱呱泡蛙",evolutions:["呱頭蛙","甲賀忍蛙"]},
  {name:"哈力栗",evolutions:["胖胖哈力","布里卡隆"]},{name:"火狐狸",evolutions:["長尾火狐","妖火紅狐"]},
  {name:"妙喵",evolutions:["超能妙喵"]},{name:"嗡蝠",evolutions:["音波龍"]},
  {name:"童偶熊",evolutions:["穿著熊"]},
  {name:"睡睡菇",evolutions:["燈罩夜菇"]},{name:"拳拳蛸",evolutions:["八爪武師"]},
  {name:"毒電嬰",evolutions:["顫弦蠑螈"]},{name:"咬咬龜",evolutions:["暴噬龜"]},
  {name:"索偵蟲",evolutions:["天罩蟲","以歐路普"]},{name:"來電汪",evolutions:["逐電犬"]},
  {name:"愛管侍"},{name:"稚山雀",evolutions:["藍鴉","鋼鎧鴉"]},
  {name:"貪心栗鼠",evolutions:["藏飽栗鼠"]},{name:"大顎蟻",evolutions:["超音波幼蟲","沙漠蜻蜓"]},
  {name:"穿山鼠"},{name:"阿羅拉穿山鼠",evolutions:["阿羅拉穿山王"]},
  {name:"六尾"},{name:"阿羅拉六尾",evolutions:["阿羅拉九尾"]},
  {name:"小拉達"},{name:"阿羅拉小拉達",evolutions:["阿羅拉拉達"]},
  {name:"地鼠"},{name:"阿羅拉地鼠",evolutions:["阿羅拉三地鼠"]},
  {name:"喵喵"},{name:"阿羅拉喵喵",evolutions:["阿羅拉貓老大"]},{name:"伽勒爾喵喵",evolutions:["喵頭目"]},
  {name:"嘎啦嘎啦"},{name:"阿羅拉嘎啦嘎啦"},{name:"雷丘"},{name:"阿羅拉雷丘"},
  {name:"臭泥"},{name:"阿羅拉臭泥",evolutions:["阿羅拉臭臭泥"]},
  {name:"雙彈瓦斯"},{name:"伽勒爾雙彈瓦斯"},{name:"蛇紋熊",evolutions:["直衝熊","堵攔熊"]},
  {name:"肯泰羅"},{name:"帕底亞肯泰羅"},{name:"猴怪",evolutions:["火爆猴","棄世猴"]},
  {name:"火爆猴",evolutions:["棄世猴"]},{name:"霹靂電球",evolutions:["頑皮雷彈"]},
  {name:"洗翠霹靂電球",evolutions:["洗翠頑皮雷彈"]},{name:"索羅亞",evolutions:["索羅亞克"]},
  {name:"洗翠索羅亞",evolutions:["洗翠索羅亞克"]},{name:"卡蒂狗",evolutions:["風速狗"]},
  {name:"洗翠卡蒂狗",evolutions:["洗翠風速狗"]},{name:"勇士雄鷹"},{name:"洗翠勇士雄鷹"},
  {name:"火暴獸"},{name:"洗翠火暴獸"},{name:"大劍鬼"},{name:"洗翠大劍鬼"},
  {name:"狙射樹梟"},{name:"洗翠狙射樹梟"},{name:"索羅亞克"},{name:"洗翠索羅亞克"},
  {name:"黏美龍"},{name:"洗翠黏美龍"},{name:"冰岩怪",evolutions:["洗翠冰岩怪"]},
  {name:"千面避役"},{name:"洗翠千面避役"},{name:"劈斧螳螂"},{name:"月月熊"},
  {name:"幽尾玄魚"},{name:"大狃拉"},{name:"萬針魚"},{name:"眷戀雲"},
  {name:"愛心魚"},{name:"泥泥鰍",evolutions:["鯰魚王"]},{name:"電螢蟲"},{name:"甜甜螢"},
  {name:"龍王蠍"},{name:"紫天蝎",evolutions:["龍王蠍"]},{name:"無殼海兔",evolutions:["海兔獸"]},
  {name:"小卡比獸",evolutions:["卡比獸"]},{name:"盆才怪",evolutions:["樹才怪"]},
  {name:"魔尼尼",evolutions:["魔牆人偶"]},{name:"小福蛋",evolutions:["吉利蛋","幸福蛋"]},
  {name:"銅鏡怪",evolutions:["青銅鐘"]},{name:"風鈴鈴"},{name:"螢光魚",evolutions:["霓虹魚"]},
  {name:"利牙魚",evolutions:["巨牙鯊"]},{name:"呆火駝",evolutions:["噴火駝"]},
  {name:"煤炭龜"},{name:"大顎蟻",evolutions:["超音波幼蟲","沙漠蜻蜓"]},
  {name:"跳跳豬",evolutions:["噗噗豬"]},{name:"晃晃斑"},{name:"貓鼬斬"},{name:"飯匙蛇"},
  {name:"古空棘魚"},{name:"海豹球",evolutions:["海魔獅","帝牙海獅"]},
  {name:"珍珠貝",evolutions:["獵斑魚","櫻花魚"]},{name:"愛心魚"},{name:"寶貝球菇",evolutions:["暴露菇"]},
  {name:"奇諾栗鼠"},{name:"哥德寶寶",evolutions:["哥德小童","哥德小姐"]},
  {name:"鐵啞鈴",evolutions:["金屬怪","巨金怪"]},
  {name:"單卵細胞球",evolutions:["雙卵細胞球","人造細胞卵"]},
  {name:"石丸子",evolutions:["地幔岩","龐岩怪"]},{name:"滾滾蝙蝠",evolutions:["心蝙蝠"]},
  {name:"螺釘地鼠",evolutions:["龍頭地鼠"]},{name:"搬運小匠",evolutions:["鐵骨土人","修建老匠"]},
  {name:"探探鼠",evolutions:["步哨鼠"]},{name:"小約克",evolutions:["哈約克","長毛狗"]},
  {name:"爆香猴",evolutions:["爆香猿"]},{name:"冷水猴",evolutions:["冷水猿"]},
  {name:"花椰猴",evolutions:["花椰猿"]},{name:"差不多娃娃"},{name:"百足蜈蚣",evolutions:["車輪毬","蜈蚣王"]},
  {name:"象徵鳥"},{name:"原蓋海龜",evolutions:["肋骨海龜"]},{name:"始祖小鳥",evolutions:["始祖大鳥"]},
  {name:"泥巴魚"},{name:"麻麻小魚",evolutions:["麻麻鰻","麻麻鰻魚王"]},
  {name:"電電蟲",evolutions:["電蜘蛛"]},{name:"種子鐵球",evolutions:["堅果啞鈴"]},
  {name:"功夫鼬",evolutions:["師父鼬"]},{name:"赤面龍"},{name:"小嘴蝸",evolutions:["敏捷蟲"]},
  {name:"蓋蓋蟲",evolutions:["騎士蝸牛"]},{name:"垃垃藻",evolutions:["毒拉蜜"]},
  {name:"鐵臂槍蝦",evolutions:["鋼炮臂蝦"]},{name:"胡說樹"},{name:"胖丁",evolutions:["胖可丁"]},
  {name:"皮寶寶",evolutions:["皮皮","皮可西"]},{name:"皮丘",evolutions:["皮卡丘","雷丘"]},{name:"呆呆獸",evolutions:["呆殼獸","呆呆王"]},
  {name:"大食花"},{name:"大針蜂"},{name:"巴大蝶"},{name:"保母蟲"},
  {name:"岩狗狗",evolutions:["鬃岩狼人"]},{name:"好勝蟹",evolutions:["好勝毛蟹"]},
  {name:"花舞鳥"},{name:"萌虻",evolutions:["蝶結萌虻"]},{name:"沙丘娃",evolutions:["噬沙堡爺"]},
  {name:"爆焰龜獸"},{name:"托戈德瑪爾"},{name:"磨牙彩皮魚"},{name:"老翁龍"},
  {name:"破破舵輪"},{name:"索爾迦雷歐"},{name:"蟲電寶",evolutions:["鍬農炮蟲"]},
  {name:"滴蛛",evolutions:["滴蛛霸"]},{name:"偽螳草",evolutions:["蘭螳花"]},
  {name:"夜盜火蜥",evolutions:["焰后蜥"]},{name:"重泥挽馬"},{name:"小篤兒",evolutions:["喇叭啄鳥","銃嘴大鳥"]},
  {name:"貓鼬探長"},{name:"貓老大"},
  // Gen8 伽勒爾
  {name:"偷兒狐",evolutions:["狐大盜"]},{name:"瓦斯彈"},{name:"伽勒爾蛇紋熊",evolutions:["伽勒爾直衝熊","堵攔熊"]},
  {name:"雙彈瓦斯"},{name:"伽勒爾雙彈瓦斯"},{name:"大蔥鴨",evolutions:["蔥遊兵"]},
  {name:"伽勒爾大蔥鴨",evolutions:["蔥遊兵"]},{name:"呆呆獸",evolutions:["呆殼獸","呆呆王"]},
  {name:"伽勒爾呆呆獸",evolutions:["伽勒爾呆殼獸","伽勒爾呆呆王"]},
  {name:"火紅不倒翁",evolutions:["達摩狒狒"]},
  {name:"伽勒爾火紅不倒翁",evolutions:["伽勒爾達摩狒狒"]},
  {name:"淚眼蜥",evolutions:["變澀蜥","千面避役"]},
  {name:"敲音猴",evolutions:["啪咚猴","轟擂金剛猩"]},
  {name:"炎兔兒",evolutions:["騰蹴小將","閃焰王牌"]},
  // Gen9 帕底亞
  {name:"呆火鱷",evolutions:["炙燙鱷","骨紋巨聲鱷"]},
  {name:"新葉喵",evolutions:["蒂蕾喵","魔幻假面喵"]},
  {name:"潤水鴨",evolutions:["湧躍鴨","狂歡浪舞鴨"]},
  {name:"小鍛匠",evolutions:["巧鍛匠","巨鍛匠"]},
  {name:"電海燕",evolutions:["大電海燕"]},
  {name:"迷你芙",evolutions:["奧利紐","奧利瓦"]},
  {name:"團珠蛇",evolutions:["沙鐵皮"]},
  {name:"光蚪仔",evolutions:["電肚蛙"]},
  {name:"燭光靈",evolutions:["燈火幽靈","水晶燈火靈"]},
  {name:"提布莉姆",evolutions:["長毛巨魔"]},
  {name:"毒電嬰",evolutions:["顫弦蠑螈"]},
  {name:"雪吞蟲",evolutions:["雪絨蛾"]},
  {name:"啃果蟲",evolutions:["蘋裹龍","豐蜜龍"]},
  {name:"小仙奶",evolutions:["霜奶仙"]},
  {name:"列陣兵"},{name:"啪嚓海膽"},{name:"冰砌鵝"},
  {name:"莫魯貝可"},
];
var addRare = [
  // Gen2 城都 - already have starters
  {name:"黑暗鴉",evolutions:["烏鴉頭頭"]},{name:"盾甲龍",evolutions:["護城龍"]},
  {name:"頭蓋龍",evolutions:["戰槌龍"]},{name:"泳圈鼬",evolutions:["浮潛鼬"]},
  {name:"小磁怪",evolutions:["三合一磁怪","自爆磁怪"]},{name:"飛天螳螂",evolutions:["巨鉗螳螂","劈斧螳螂"]},
  // Gen3 豐緣
  {name:"蘑蘑菇",evolutions:["斗笠菇"]},{name:"瑪沙那",evolutions:["恰雷姆"]},
  {name:"可可多拉",evolutions:["可多拉","波士可多拉"]},{name:"觸手百合",evolutions:["搖籃百合"]},
  {name:"太古羽蟲",evolutions:["太古盔甲"]},{name:"醜醜魚",evolutions:["美納斯"]},
  // Gen4 神奧
  {name:"波克比",evolutions:["波克基古","波克基斯"]},{name:"小火焰猴",evolutions:["猛火猴","烈焰猴"]},
  {name:"草苗龜",evolutions:["樹林龜","土台龜"]},{name:"波加曼",evolutions:["波皇子","帝王拿波"]},
  {name:"姆克兒",evolutions:["姆克鳥","姆克鷹"]},{name:"小貓怪",evolutions:["勒克貓","倫琴貓"]},
  // Gen5 合眾
  {name:"暖暖豬",evolutions:["炒炒豬","炎武王"]},{name:"藤藤蛇",evolutions:["青藤蛇","君主蛇"]},
  {name:"水水獺",evolutions:["雙刃丸","大劍鬼"]},{name:"火球鼠",evolutions:["火岩鼠","火爆獸"]},
  {name:"菊草葉",evolutions:["月桂葉","大菊花"]},{name:"小鋸鱷",evolutions:["藍鱷","大力鱷"]},
  {name:"圓陸鯊",evolutions:["尖牙陸鯊","烈咬陸鯊"]},{name:"由基拉",evolutions:["沙基拉斯","班基拉斯"]},
  {name:"寶貝龍",evolutions:["甲殼龍","暴飛龍"]},{name:"利歐路",evolutions:["路卡利歐"]},
  {name:"拉魯拉絲",evolutions:["奇魯莉安","沙奈朵","艾路雷朵"]},
  {name:"迷你龍",evolutions:["哈克龍","快龍"]},
  {name:"鐵啞鈴",evolutions:["金屬怪","巨金怪"]},
  {name:"黏黏寶",evolutions:["黏美兒","黏美龍"]},
  {name:"心鱗寶",evolutions:["鱗甲龍","杖尾鱗甲龍"]},
];
var addLegendary = [
  // Gen2 傳說三犬+鳳王洛奇亞
  {name:"雷公",legendary:true},{name:"炎帝",legendary:true},{name:"水君",legendary:true},
  {name:"雪拉比",legendary:true},
  // Gen3 豐緣
  {name:"拉帝亞斯",legendary:true},{name:"拉帝歐斯",legendary:true},
  {name:"烈空坐",legendary:true},{name:"蓋歐卡",legendary:true},{name:"固拉多",legendary:true},
  {name:"基拉祈",legendary:true},{name:"代歐奇希斯",legendary:true},
  {name:"雷吉洛克",legendary:true},{name:"雷吉艾斯",legendary:true},{name:"雷吉斯奇魯",legendary:true},
  // Gen4 神奧
  {name:"由克希",legendary:true},{name:"艾姆利多",legendary:true},{name:"亞克諾姆",legendary:true},
  {name:"帝牙盧卡",legendary:true},{name:"帕路奇亞",legendary:true},{name:"騎拉帝納",legendary:true},
  {name:"席多藍恩",legendary:true},{name:"雷吉奇卡斯",legendary:true},
  {name:"克雷色利亞",legendary:true},{name:"達克萊伊",legendary:true},
  {name:"阿爾宙斯",legendary:true},{name:"霏歐納",legendary:true},{name:"瑪納霏",legendary:true},
  {name:"謝米",legendary:true},{name:"騎拉帝納",legendary:true},
  // Gen5 合眾
  {name:"勾帕路翁",legendary:true},{name:"代拉基翁",legendary:true},{name:"畢力吉翁",legendary:true},
  {name:"凱路迪歐",legendary:true},
  {name:"雷希拉姆",legendary:true},{name:"捷克羅姆",legendary:true},{name:"酋雷姆",legendary:true},
  {name:"土地雲",legendary:true},{name:"龍捲雲",legendary:true},{name:"雷電雲",legendary:true},
  {name:"美洛耶塔",legendary:true},{name:"比克提尼",legendary:true},
  // Gen6 卡洛斯
  {name:"哲爾尼亞斯",legendary:true},{name:"伊裴爾塔爾",legendary:true},{name:"基格爾德",legendary:true},
  {name:"蒂安希",legendary:true},{name:"胡帕",legendary:true},{name:"波爾凱尼恩",legendary:true},
  // Gen7 阿羅拉
  {name:"卡璞・鳴鳴",legendary:true},{name:"卡璞・蝶蝶",legendary:true},
  {name:"卡璞・哞哞",legendary:true},{name:"卡璞・鰭鰭",legendary:true},
  {name:"科斯莫古",legendary:true},{name:"科斯莫姆",legendary:true},
  {name:"索爾迦雷歐",legendary:true},{name:"露奈雅拉",legendary:true},
  {name:"奈克洛茲瑪",legendary:true},{name:"瑪機雅娜",legendary:true},
  {name:"毒貝比",evolutions:["四顎針龍"],legendary:true},
  {name:"紙御劍",legendary:true},{name:"鐵火輝夜",legendary:true},
  {name:"虛吾伊德",legendary:true},{name:"爆肌蚊",legendary:true},
  {name:"費洛美螂",legendary:true},{name:"電束木",legendary:true},
  {name:"惡食大王",legendary:true},{name:"壘磊石",legendary:true},
  {name:"砰頭小丑",legendary:true},{name:"瑪夏多",legendary:true},
  // Gen8 伽勒爾
  {name:"蒼響",legendary:true},{name:"藏瑪然特",legendary:true},
  {name:"無極汰那",legendary:true},{name:"熊徒弟",legendary:true},{name:"武道熊師",legendary:true},
  {name:"雷吉艾勒奇",legendary:true},{name:"雷吉鐸拉戈",legendary:true},
  {name:"雪暴馬",legendary:true},{name:"靈幽馬",legendary:true},
  {name:"蕾冠王",legendary:true},{name:"薩戮德",legendary:true},
  // Gen9 帕底亞
  {name:"故勒頓",legendary:true},{name:"密勒頓",legendary:true},
  {name:"厄鬼椪",legendary:true},{name:"太樂巴戈斯",legendary:true},
  {name:"古簡蝸",legendary:true},{name:"古劍豹",legendary:true},
  {name:"古鼎鹿",legendary:true},{name:"古玉魚",legendary:true},
  {name:"轟鳴月",legendary:true},{name:"鐵武者",legendary:true},
  {name:"振翼髮",legendary:true},{name:"猛惡菇",legendary:true},
  {name:"爬地翅",legendary:true},{name:"沙鐵皮",legendary:true},
  {name:"鐵毒蛾",legendary:true},{name:"鐵荊棘",legendary:true},
  {name:"鐵頭殼",legendary:true},{name:"鐵臂膀",legendary:true},
  {name:"鐵捆子",legendary:true},{name:"奧利瓦"},{name:"吉雉雞",legendary:true},
  {name:"夠讚狗",legendary:true},{name:"願增猿",legendary:true},
  {name:"基格爾德"},{name:"丹瑜"},{name:"烏栗"},
  {name:"桃歹郎",legendary:true},
];

// Remove potential duplicates from existing TIERS
function dedupe(arr) {
  var seen = {}, out = [];
  for (var i=0;i<arr.length;i++) {
    if (!seen[arr[i].name]) { seen[arr[i].name]=true; out.push(arr[i]); }
  }
  return out;
}
POKEMON_TIERS["一般"] = dedupe(POKEMON_TIERS["一般"].concat(addCommon));
POKEMON_TIERS["稀有"] = dedupe(POKEMON_TIERS["稀有"].concat(addRare));
POKEMON_TIERS["傳說"] = dedupe(POKEMON_TIERS["傳說"].concat(addLegendary));

// ========== SPECIES_TYPES EXTENSION ==========
var extraTypes = {
  // Gen2
  "戴魯比":["惡","火"],"黑魯加":["惡","火"],
  "黑暗鴉":["惡","飛行"],"烏鴉頭頭":["惡","飛行"],
  "盾甲龍":["岩石","鋼"],"護城龍":["岩石","鋼"],
  "頭蓋龍":["岩石"],"戰槌龍":["岩石"],
  "泳圈鼬":["水"],"浮潛鼬":["水"],
  "雷公":["電"],"炎帝":["火"],"水君":["水"],
  "雪拉比":["超能力","草"],
  "咩利羊":["電"],"茸茸羊":["電"],"電龍":["電"],
  "烏波":["水","地面"],"沼王":["水","地面"],
  "天然雀":["超能力","飛行"],"天然鳥":["超能力","飛行"],
  "呆呆魚":["水"],"呆呆王":["水","超能力"],
  "小鴨嘴火龍":["火"],"鴨嘴炎獸":["火"],"皮丘":["電"],
  "電擊怪":["電"],"電擊魔獸":["電"],
  "溶食獸":["毒"],"吞食獸":["毒"],
  "吼爆彈":["一般"],"爆音怪":["一般"],
  "向尾喵":["一般"],"優雅貓":["一般"],
  "幕下力士":["格鬥"],"鐵掌力士":["格鬥"],
  "刺尾蟲":["蟲"],"甲殼蛹":["蟲"],"狩獵鳳蝶":["蟲","飛行"],
  "盾甲繭":["蟲"],"毒粉蛾":["蟲","毒"],
  "橡實果":["草"],"長鼻葉":["草","惡"],"狡猾天狗":["草","惡"],
  "蓮葉童子":["水","草"],"蓮帽小童":["水","草"],"樂天河童":["水","草"],
  "龍蝦小兵":["水"],"鐵螯龍蝦":["水","惡"],
  "駒刀小兵":["惡","鋼"],"劈斬司令":["惡","鋼"],"仆斬將軍":["惡","鋼"],
  "好啦魷":["惡","超能力"],"烏賊王":["惡","超能力"],
  "呱呱泡蛙":["水"],"呱頭蛙":["水"],"甲賀忍蛙":["水","惡"],
  "哈力栗":["草"],"胖胖哈力":["草","格鬥"],"布里卡隆":["草","格鬥"],
  "火狐狸":["火"],"長尾火狐":["火","超能力"],"妖火紅狐":["火","超能力"],
  "妙喵":["超能力"],"超能妙喵":["超能力"],
  "嗡蝠":["飛行","龍"],"音波龍":["飛行","龍"],
  "毒貝比":["毒"],"四顎針龍":["毒","龍"],
  "童偶熊":["一般","格鬥"],"穿著熊":["一般","格鬥"],
  "睡睡菇":["草","妖精"],"燈罩夜菇":["草","妖精"],
  "拳拳蛸":["格鬥"],"八爪武師":["格鬥"],
  "毒電嬰":["電"],"顫弦蠑螈":["電"],
  "咬咬龜":["水"],"暴噬龜":["水","岩石"],
  "索偵蟲":["蟲"],"天罩蟲":["蟲","超能力"],"以歐路普":["蟲","超能力"],
  "來電汪":["電"],"逐電犬":["電"],
  "愛管侍":["超能力","一般"],
  "稚山雀":["飛行"],"藍鴉":["飛行"],"鋼鎧鴉":["飛行","鋼"],
  "貪心栗鼠":["一般"],"藏飽栗鼠":["一般"],
  "大顎蟻":["地面"],"超音波幼蟲":["地面","龍"],"沙漠蜻蜓":["地面","龍"],
  "小卡比獸":["一般"],
  "盆才怪":["岩石"],"樹才怪":["岩石"],
  "魔尼尼":["超能力","妖精"],
  "小福蛋":["一般"],"吉利蛋":["一般"],"幸福蛋":["一般"],
  "銅鏡怪":["鋼","超能力"],"青銅鐘":["鋼","超能力"],
  "風鈴鈴":["超能力"],
  "螢光魚":["水"],"霓虹魚":["水"],
  "利牙魚":["水","惡"],"巨牙鯊":["水","惡"],
  "呆火駝":["火","地面"],"噴火駝":["火","地面"],
  "煤炭龜":["火"],
  "跳跳豬":["超能力"],"噗噗豬":["超能力"],
  "晃晃斑":["一般"],
  "貓鼬斬":["一般"],"飯匙蛇":["毒"],
  "古空棘魚":["水","岩石"],
  "海豹球":["水","冰"],"海魔獅":["水","冰"],"帝牙海獅":["水","冰"],
  "珍珠貝":["水"],"獵斑魚":["水"],"櫻花魚":["水"],
  "寶貝球菇":["草","毒"],"暴露菇":["草","毒"],
  "奇諾栗鼠":["一般"],
  "哥德寶寶":["超能力"],"哥德小童":["超能力"],"哥德小姐":["超能力"],
  "單卵細胞球":["超能力"],"雙卵細胞球":["超能力"],"人造細胞卵":["超能力"],
  "石丸子":["岩石"],"地幔岩":["岩石"],"龐岩怪":["岩石"],
  "滾滾蝙蝠":["超能力","飛行"],"心蝙蝠":["超能力","飛行"],
  "螺釘地鼠":["地面"],"龍頭地鼠":["地面","鋼"],
  "搬運小匠":["格鬥"],"鐵骨土人":["格鬥"],"修建老匠":["格鬥"],
  "探探鼠":["一般"],"步哨鼠":["一般"],
  "小約克":["一般"],"哈約克":["一般"],"長毛狗":["一般"],
  "爆香猴":["火"],"爆香猿":["火"],
  "冷水猴":["水"],"冷水猿":["水"],
  "花椰猴":["草"],"花椰猿":["草"],
  "差不多娃娃":["一般"],
  "百足蜈蚣":["蟲","毒"],"車輪毬":["蟲","毒"],"蜈蚣王":["蟲","毒"],
  "象徵鳥":["超能力","飛行"],
  "原蓋海龜":["水","岩石"],"肋骨海龜":["水","岩石"],
  "始祖小鳥":["岩石","飛行"],"始祖大鳥":["岩石","飛行"],
  "泥巴魚":["地面","電"],
  "麻麻小魚":["電"],"麻麻鰻":["電"],"麻麻鰻魚王":["電"],
  "電電蟲":["蟲","電"],"電蜘蛛":["蟲","電"],
  "種子鐵球":["草","鋼"],"堅果啞鈴":["草","鋼"],
  "功夫鼬":["格鬥"],"師父鼬":["格鬥"],
  "赤面龍":["龍"],
  "小嘴蝸":["蟲"],"敏捷蟲":["蟲"],
  "蓋蓋蟲":["蟲"],"騎士蝸牛":["蟲","鋼"],
  "垃垃藻":["水","毒"],"毒拉蜜":["水","毒"],
  "鐵臂槍蝦":["水"],"鋼炮臂蝦":["水"],
  // Alola forms
  "阿羅拉穿山鼠":["冰","鋼"],"阿羅拉穿山王":["冰","鋼"],
  "阿羅拉六尾":["冰"],"阿羅拉九尾":["冰","妖精"],
  "阿羅拉小拉達":["惡","一般"],"阿羅拉拉達":["惡","一般"],
  "阿羅拉地鼠":["地面","鋼"],"阿羅拉三地鼠":["地面","鋼"],
  "阿羅拉喵喵":["惡"],"阿羅拉貓老大":["惡"],
  "伽勒爾喵喵":["鋼"],"喵頭目":["鋼"],
  "阿羅拉嘎啦嘎啦":["火","幽靈"],
  "阿羅拉雷丘":["電","超能力"],
  "阿羅拉臭泥":["毒","惡"],"阿羅拉臭臭泥":["毒","惡"],
  "伽勒爾雙彈瓦斯":["毒","妖精"],
  "伽勒爾蛇紋熊":["惡","一般"],"伽勒爾直衝熊":["惡","一般"],"堵攔熊":["惡","一般"],
  "帕底亞肯泰羅":["格鬥"],
  "伽勒爾大蔥鴨":["格鬥"],"蔥遊兵":["格鬥"],
  "伽勒爾呆呆獸":["超能力"],"伽勒爾呆殼獸":["毒","超能力"],"伽勒爾呆呆王":["毒","超能力"],
  "伽勒爾火紅不倒翁":["冰"],"伽勒爾達摩狒狒":["冰"],
  "洗翠霹靂電球":["電","草"],"洗翠頑皮雷彈":["電","草"],
  "洗翠索羅亞":["一般","幽靈"],"洗翠索羅亞克":["一般","幽靈"],
  "洗翠卡蒂狗":["火","岩石"],"洗翠風速狗":["火","岩石"],
  "洗翠勇士雄鷹":["超能力","飛行"],
  "洗翠火暴獸":["火","幽靈"],
  "洗翠大劍鬼":["水","惡"],
  "洗翠狙射樹梟":["草","格鬥"],
  "洗翠黏美龍":["龍","鋼"],
  "洗翠冰岩怪":["冰","岩石"],
  "劈斧螳螂":["蟲","岩石"],
  "月月熊":["地面","一般"],
  "幽尾玄魚":["水","幽靈"],
  "大狃拉":["毒","格鬥"],
  "萬針魚":["毒","水"],
  "眷戀雲":["超能力","飛行"],
  "自爆磁怪":["電","鋼"],"巨鉗螳螂":["蟲","鋼"],
  // Gen2
  "黑暗鴉":["惡","飛行"],"烏鴉頭頭":["惡","飛行"],
  "圖圖犬":["一般"],
  "大奶罐":["一般"],
  "麒麟奇":["一般","超能力"],
  "榛果球":["蟲"],"佛烈托斯":["蟲","鋼"],
  "壺壺":["蟲","岩石"],
  "土龍弟弟":["一般"],
  "布魯":["妖精"],"布魯皇":["妖精"],
  "千針魚":["水","毒"],
  "太陽珊瑚":["水","岩石"],
  "鐵炮魚":["水"],"章魚桶":["水"],
  "信使鳥":["冰","飛行"],
  "巨翅飛魚":["水","飛行"],
  "驚角鹿":["一般"],"詭角鹿":["一般","超能力"],
  "巴爾郎":["格鬥"],"沙瓦郎":["格鬥"],"艾比郎":["格鬥"],"柯波朗":["格鬥"],
  "赫拉克羅斯":["蟲","格鬥"],
  "狃拉":["惡","冰"],"瑪狃拉":["惡","冰"],
  "熊寶寶":["一般"],"圈圈熊":["一般"],
  "小山豬":["冰","地面"],"長毛豬":["冰","地面"],"象牙豬":["冰","地面"],
  "小小象":["地面"],"頓甲":["地面"],
  // Gen2 legendaries
  "雷公":["電"],"炎帝":["火"],"水君":["水"],
  "雪拉比":["超能力","草"],
  // Gen3
  "拉帝亞斯":["龍","超能力"],"拉帝歐斯":["龍","超能力"],
  "基拉祈":["鋼","超能力"],"代歐奇希斯":["超能力"],
  "雷吉洛克":["岩石"],"雷吉艾斯":["冰"],"雷吉斯奇魯":["鋼"],
  "蘑蘑菇":["草"],"斗笠菇":["草","格鬥"],
  "瑪沙那":["格鬥","超能力"],"恰雷姆":["格鬥","超能力"],
  "可可多拉":["鋼","岩石"],"可多拉":["鋼","岩石"],"波士可多拉":["鋼","岩石"],
  "觸手百合":["岩石","草"],"搖籃百合":["岩石","草"],
  "太古羽蟲":["岩石","蟲"],"太古盔甲":["岩石","蟲"],
  "醜醜魚":["水"],"美納斯":["水"],
  // Gen4
  "波克比":["妖精"],"波克基古":["妖精","飛行"],"波克基斯":["妖精","飛行"],
  "小火焰猴":["火"],"猛火猴":["火","格鬥"],"烈焰猴":["火","格鬥"],
  "草苗龜":["草"],"樹林龜":["草"],"土台龜":["草","地面"],
  "波加曼":["水"],"波皇子":["水"],"帝王拿波":["水","鋼"],
  "由克希":["超能力"],"艾姆利多":["超能力"],"亞克諾姆":["超能力"],
  "席多藍恩":["火","鋼"],"雷吉奇卡斯":["一般"],
  "克雷色利亞":["超能力"],"達克萊伊":["惡"],
  "霏歐納":["水"],"瑪納霏":["水"],
  "謝米":["草"],
  "愛心魚":["水"],
  "泥泥鰍":["水","地面"],"鯰魚王":["水","地面"],
  "電螢蟲":["蟲"],"甜甜螢":["蟲"],
  "龍王蠍":["毒","惡"],"紫天蝎":["毒","蟲"],
  "無殼海兔":["水"],"海兔獸":["水","地面"],
  // Gen5 legendaries
  "勾帕路翁":["鋼","格鬥"],"代拉基翁":["岩石","格鬥"],"畢力吉翁":["草","格鬥"],
  "凱路迪歐":["水","格鬥"],
  "土地雲":["地面","飛行"],"龍捲雲":["飛行"],"雷電雲":["電","飛行"],
  "美洛耶塔":["一般","超能力"],
  "比克提尼":["超能力","火"],
  // Gen6
  "蒂安希":["岩石","妖精"],"胡帕":["幽靈","超能力"],"波爾凱尼恩":["火","水"],
  // Gen7
  "卡璞・鳴鳴":["電","妖精"],"卡璞・蝶蝶":["超能力","妖精"],
  "卡璞・哞哞":["草","妖精"],"卡璞・鰭鰭":["水","妖精"],
  "科斯莫古":["超能力"],"科斯莫姆":["超能力"],
  "奈克洛茲瑪":["超能力"],
  "瑪機雅娜":["鋼","妖精"],
  "紙御劍":["草","鋼"],"鐵火輝夜":["鋼","飛行"],
  "虛吾伊德":["岩石","毒"],"爆肌蚊":["蟲","格鬥"],
  "費洛美螂":["蟲","格鬥"],"電束木":["電"],
  "惡食大王":["惡","龍"],"壘磊石":["岩石","鋼"],
  "砰頭小丑":["火","幽靈"],"瑪夏多":["格鬥","幽靈"],
  "岩狗狗":["岩石"],"鬃岩狼人":["岩石"],
  "好勝蟹":["格鬥"],"好勝毛蟹":["格鬥","冰"],
  "花舞鳥":["火","飛行"],
  "萌虻":["蟲","妖精"],"蝶結萌虻":["蟲","妖精"],
  "沙丘娃":["幽靈","地面"],"噬沙堡爺":["幽靈","地面"],
  "爆焰龜獸":["火","龍"],"托戈德瑪爾":["電","鋼"],
  "磨牙彩皮魚":["水","超能力"],
  "老翁龍":["一般","龍"],
  "破破舵輪":["幽靈","草"],
  "蟲電寶":["蟲","電"],"鍬農炮蟲":["蟲","電"],
  "滴蛛":["水","蟲"],"滴蛛霸":["水","蟲"],
  "偽螳草":["草"],"蘭螳花":["草"],
  "夜盜火蜥":["毒","火"],"焰后蜥":["毒","火"],
  "重泥挽馬":["地面"],
  "小篤兒":["一般","飛行"],"喇叭啄鳥":["一般","飛行"],"銃嘴大鳥":["一般","飛行"],
  "貓鼬探長":["一般"],
  // Gen8
  "偷兒狐":["惡"],"狐大盜":["惡"],
  "雪吞蟲":["冰"],"雪絨蛾":["冰","飛行"],
  "啃果蟲":["草","龍"],"蘋裹龍":["草","龍"],"豐蜜龍":["草","龍"],
  "小仙奶":["妖精"],"霜奶仙":["妖精"],
  "列陣兵":["格鬥"],
  "啪嚓海膽":["電"],
  "冰砌鵝":["水","冰"],
  "莫魯貝可":["電","惡"],
  "蒼響":["妖精","鋼"],"藏瑪然特":["格鬥","鋼"],
  "熊徒弟":["格鬥"],"武道熊師":["格鬥","惡"],
  "雷吉艾勒奇":["電"],"雷吉鐸拉戈":["龍"],
  "雪暴馬":["冰"],"靈幽馬":["幽靈"],
  "蕾冠王":["超能力","草"],
  "薩戮德":["惡","草"],
  // Gen9
  "呆火鱷":["火"],"炙燙鱷":["火"],"骨紋巨聲鱷":["火","幽靈"],
  "新葉喵":["草"],"蒂蕾喵":["草"],"魔幻假面喵":["草","惡"],
  "潤水鴨":["水"],"湧躍鴨":["水"],"狂歡浪舞鴨":["水","格鬥"],
  "豆蟋蟀":["蟲"],"圓法師":["蟲"],"音箱蟀":["蟲"],
  "布撥":["電"],"布土撥":["電","格鬥"],"巴布土撥":["電","格鬥"],
  "小鍛匠":["妖精","鋼"],"巧鍛匠":["妖精","鋼"],"巨鍛匠":["妖精","鋼"],
  "電海燕":["電","飛行"],"大電海燕":["電","飛行"],
  "迷你芙":["草","一般"],"奧利紐":["草","一般"],"奧利瓦":["草","一般"],
  "團珠蛇":["毒"],"沙鐵皮":["地面","鋼"],
  "光蚪仔":["電"],"電肚蛙":["電"],
  "燭光靈":["火","幽靈"],"燈火幽靈":["火","幽靈"],"水晶燈火靈":["火","幽靈"],
  "提布莉姆":["妖精"],"長毛巨魔":["妖精","惡"],
  "古簡蝸":["惡","草"],"古劍豹":["惡","冰"],
  "古鼎鹿":["惡","地面"],"古玉魚":["惡","火"],
  "轟鳴月":["龍","飛行"],"鐵武者":["妖精","格鬥"],
  "振翼髮":["幽靈","妖精"],"猛惡菇":["草","惡"],
  "爬地翅":["蟲","格鬥"],
  "鐵毒蛾":["火","毒"],"鐵荊棘":["電","岩石"],
  "鐵頭殼":["惡","水"],"鐵臂膀":["格鬥","電"],
  "鐵捆子":["水","鋼"],
  "吉雉雞":["毒","妖精"],
  "夠讚狗":["毒","格鬥"],"願增猿":["毒","超能力"],
  "桃歹郎":["毒","幽靈"],
  // Missing Gen2-4
  "波克比":["妖精"],
  "小火焰猴":["火"],
  "草苗龜":["草"],
  "波加曼":["水"],
  "姆克兒":["一般","飛行"],"姆克鳥":["一般","飛行"],"姆克鷹":["一般","飛行"],
  "小貓怪":["電"],"勒克貓":["電"],"倫琴貓":["電"],
  "盾甲龍":["岩石","鋼"],"護城龍":["岩石","鋼"],
  "頭蓋龍":["岩石"],"戰槌龍":["岩石"],
  "泳圈鼬":["水"],"浮潛鼬":["水"],
  
  // Gen5
  "水水獺":["水"],"雙刃丸":["水"],"大劍鬼":["水"],
  "索羅亞":["惡"],"索羅亞克":["惡"],"洗翠索羅亞":["一般","幽靈"],"洗翠索羅亞克":["一般","幽靈"],
  "保母蟲":["蟲","草"],
  "始祖小鳥":["岩石","飛行"],"始祖大鳥":["岩石","飛行"],
  "火紅不倒翁":["火"],"達摩狒狒":["火"],
  "原蓋海龜":["水","岩石"],"肋骨海龜":["水","岩石"],
  "勇士雄鷹":["一般","飛行"],
  "果然翁":["超能力"],
  "胡說樹":["岩石"],
  "火暴獸":["火"],
  "沙基拉斯":["岩石","地面"],
  "由基拉":["岩石","地面"],
  // Eeveelution alternate naming variants
  "雷精靈":["電"],"水精靈":["水"],"火精靈":["火"],
  "太陽精靈":["超能力"],"月亮精靈":["惡"],
  "葉精靈":["草"],"冰精靈":["冰"],"仙子精靈":["妖精"],
};

// Merge types
for (var k in extraTypes) { POKEMON_SPECIES_TYPES[k] = extraTypes[k]; }

// ========== MOVE_DATABASE EXTENSION ==========
var extraMoves = {
  // Gen2~4 moves
  "火焰踢":   { power: 85,  type: "火",    category: "物理", desc: "可能燒傷對手", effect: "burn" },
  "閃電踢":   { power: 90,  type: "電",    category: "物理", desc: "可能麻痹對手", effect: "paralyze" },
  "冰凍拳":   { power: 75,  type: "冰",    category: "物理", desc: "可能凍結對手", effect: "freeze" },
  "雷電拳":   { power: 75,  type: "電",    category: "物理", desc: "可能麻痹對手", effect: "paralyze" },
  "火焰拳":   { power: 75,  type: "火",    category: "物理", desc: "可能燒傷對手", effect: "burn" },
  "精神利刃": { power: 70,  type: "超能力",category: "物理", desc: "容易擊中要害" },
  "十字剪":   { power: 80,  type: "蟲",    category: "物理", desc: "用鐮刀交叉攻擊" },
  "水之尾":   { power: 90,  type: "水",    category: "物理", desc: "用尾巴拍擊" },
  "鐵尾":     { power: 100, type: "鋼",    category: "物理", desc: "可能降低對手防禦" },
  "龍之舞":   { power: 0,   type: "龍",    category: "變化", desc: "提升攻擊速度", effect: "buff_atk" },
  "劍舞":     { power: 0,   type: "一般",  category: "變化", desc: "大幅提升攻擊", effect: "buff_atk" },
  "冥想":     { power: 0,   type: "超能力",category: "變化", desc: "提升特攻特防", effect: "buff_atk" },
  "戲法空間": { power: 0,   type: "超能力",category: "變化", desc: "速度慢的優先攻擊" },
  "欺詐":     { power: 95,  type: "惡",    category: "物理", desc: "用對手攻擊力計算" },
  "欺騙空間": { power: 0,   type: "超能力",category: "變化", desc: "速度慢的優先行動" },
  "憤怒門牙": { power: 1,   type: "一般",  category: "物理", desc: "HP減半" },
  "地球上投": { power: 1,   type: "格鬥",  category: "物理", desc: "造成等同等級的傷害" },
  "音速拳":   { power: 40,  type: "格鬥",  category: "物理", desc: "先制攻擊" },
  "子彈拳":   { power: 40,  type: "鋼",    category: "物理", desc: "先制攻擊" },
  "冰柱針":   { power: 25,  type: "冰",    category: "物理", desc: "2~5次連續攻擊" },
  "岩石爆擊": { power: 25,  type: "岩石",  category: "物理", desc: "2~5次連續攻擊" },
  "種子機關槍":{ power: 25, type: "草",    category: "物理", desc: "2~5次連續攻擊" },
  "飛彈針":   { power: 25,  type: "蟲",    category: "物理", desc: "2~5次連續攻擊" },
  "毒菱":     { power: 0,   type: "毒",    category: "變化", desc: "撒下毒菱", effect: "poison" },
  "隱形岩":   { power: 0,   type: "岩石",  category: "變化", desc: "撒下隱形岩" },
  "光牆":     { power: 0,   type: "超能力",category: "變化", desc: "降低特殊傷害", effect: "buff_def" },
  "反射壁":   { power: 0,   type: "超能力",category: "變化", desc: "降低物理傷害", effect: "buff_def" },
  "生命水滴": { power: 0,   type: "水",    category: "變化", desc: "回復全隊HP", effect: "heal_50" },
  "治癒鈴聲": { power: 0,   type: "一般",  category: "變化", desc: "治癒全隊異常狀態" },
  "再來一次": { power: 0,   type: "一般",  category: "變化", desc: "讓對手重複使用招式" },
  "電磁波":   { power: 0,   type: "電",    category: "變化", desc: "麻痹對手", effect: "paralyze" },
  "劇毒":     { power: 0,   type: "毒",    category: "變化", desc: "讓對手嚴重中毒", effect: "poison" },
  "鬼火":     { power: 0,   type: "火",    category: "變化", desc: "燒傷對手", effect: "burn" },
  "替身":     { power: 0,   type: "一般",  category: "變化", desc: "消耗HP製造替身", effect: "substitute" },
  "守住":     { power: 0,   type: "一般",  category: "變化", desc: "完全抵擋攻擊", effect: "protect" },
  "看穿":     { power: 0,   type: "格鬥",  category: "變化", desc: "完全抵擋攻擊", effect: "protect" },
  "挺住":     { power: 0,   type: "一般",  category: "變化", desc: "保留1HP" },
  "睡覺":     { power: 0,   type: "超能力",category: "變化", desc: "回復所有HP並睡眠", effect: "heal_50" },
  "光合作用": { power: 0,   type: "草",    category: "變化", desc: "回復HP", effect: "heal_50" },
  "晨光":     { power: 0,   type: "一般",  category: "變化", desc: "回復HP", effect: "heal_50" },
  "月光":     { power: 0,   type: "妖精",  category: "變化", desc: "回復HP", effect: "heal_50" },
  "噴射火焰": { power: 90,  type: "火",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "冷凍光束": { power: 90,  type: "冰",    category: "特殊", desc: "可能凍結對手", effect: "freeze" },
  "打雷":     { power: 110, type: "電",    category: "特殊", desc: "可能麻痹對手", effect: "paralyze" },
  "暴風雪":   { power: 110, type: "冰",    category: "特殊", desc: "可能凍結對手", effect: "freeze" },
  "水炮":     { power: 110, type: "水",    category: "特殊", desc: "向對手發射強力水柱" },
  "大字爆":   { power: 110, type: "火",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "破壞光線": { power: 150, type: "一般",  category: "特殊", desc: "下一回合無法行動" },
  "終極衝擊": { power: 150, type: "一般",  category: "物理", desc: "下一回合無法行動" },
  "岩石封鎖": { power: 60,  type: "岩石",  category: "物理", desc: "降低對手速度" },
  "尖石攻擊": { power: 100, type: "岩石",  category: "物理", desc: "容易擊中要害" },
  "岩石炮":   { power: 150, type: "岩石",  category: "物理", desc: "下一回合無法行動" },
  "岩崩":     { power: 75,  type: "岩石",  category: "物理", desc: "可能讓對手畏縮" },
  "地震":     { power: 100, type: "地面",  category: "物理", desc: "引發地震攻擊" },
  "挖洞":     { power: 80,  type: "地面",  category: "物理", desc: "潛入地下一回合" },
  "直衝鑽":   { power: 80,  type: "地面",  category: "物理", desc: "容易擊中要害" },
  "大爆炸":   { power: 250, type: "一般",  category: "物理", desc: "使用者瀕死", effect: "self_kill" },
  "自爆":     { power: 200, type: "一般",  category: "物理", desc: "使用者瀕死", effect: "self_kill" },
  // Gen5+ exclusive moves
  "瘋狂伏特": { power: 90,  type: "電",    category: "物理", desc: "反彈部分傷害" },
  "閃焰衝鋒": { power: 120, type: "火",    category: "物理", desc: "反彈部分傷害", effect: "burn" },
  "木角":     { power: 75,  type: "草",    category: "物理", desc: "回復傷害一半HP" },
  "十字毒刃": { power: 70,  type: "毒",    category: "物理", desc: "可能中毒對手", effect: "poison" },
  "毒突":     { power: 80,  type: "毒",    category: "物理", desc: "可能中毒對手", effect: "poison" },
  "暗影爪":   { power: 70,  type: "幽靈",  category: "物理", desc: "容易擊中要害" },
  "暗影偷襲": { power: 40,  type: "幽靈",  category: "物理", desc: "先制攻擊" },
  "潛水":     { power: 80,  type: "水",    category: "物理", desc: "潛入水中一回合" },
  "攀瀑":     { power: 80,  type: "水",    category: "物理", desc: "可能讓對手畏縮" },
  "飛天":     { power: 90,  type: "飛行",  category: "物理", desc: "飛上天空一回合" },
  "勇鳥猛攻": { power: 120, type: "飛行",  category: "物理", desc: "反彈部分傷害" },
  "急轉彎":   { power: 60,  type: "飛行",  category: "物理", desc: "攻擊後可替換寶可夢" },
  "伏特交換": { power: 70,  type: "電",    category: "特殊", desc: "攻擊後可替換寶可夢" },
  "急速折返": { power: 70,  type: "蟲",    category: "物理", desc: "攻擊後可替換寶可夢" },
  "拋下狠話": { power: 70,  type: "惡",    category: "特殊", desc: "攻擊後可替換寶可夢" },
  "打草結":   { power: 1,   type: "草",    category: "特殊", desc: "對手越重威力越大" },
  "垃圾射擊": { power: 120, type: "毒",    category: "物理", desc: "可能中毒對手", effect: "poison" },
  "鐵蹄光線": { power: 140, type: "鋼",    category: "特殊", desc: "反彈部分傷害" },
  "加農光炮": { power: 80,  type: "鋼",    category: "特殊", desc: "可能降低特防" },
  "光澤電炮": { power: 80,  type: "電",    category: "特殊", desc: "可能降低特防" },
  "月亮之力": { power: 95,  type: "妖精",  category: "特殊", desc: "降低對手特攻" },
  "魔法火焰": { power: 75,  type: "火",    category: "特殊", desc: "降低對手特攻" },
  "放電":     { power: 80,  type: "電",    category: "特殊", desc: "可能麻痹對手", effect: "paralyze" },
  "濁流":     { power: 90,  type: "水",    category: "特殊", desc: "可能降低命中" },
  "熱風":     { power: 95,  type: "火",    category: "特殊", desc: "可能燒傷對手", effect: "burn" },
  "暴風":     { power: 110, type: "飛行",  category: "特殊", desc: "可能混亂對手" },
  "龍星群":   { power: 120, type: "龍",    category: "特殊", desc: "大幅降低特攻" },
  "時間咆哮": { power: 150, type: "龍",    category: "特殊", desc: "下一回合無法行動" },
  "根源波動": { power: 110, type: "水",    category: "特殊", desc: "蓋歐卡的專屬招式" },
  "斷崖之劍": { power: 120, type: "地面",  category: "物理", desc: "固拉多的專屬招式" },
  "亞空裂斬": { power: 100, type: "龍",    category: "特殊", desc: "帕路奇亞的專屬招式" },
  "影子偷襲": { power: 40,  type: "幽靈",  category: "物理", desc: "先制攻擊" },
};

for (var m in extraMoves) { MOVE_DATABASE[m] = extraMoves[m]; }

// ========== SIGNATURE_MOVES EXTENSION ==========
var extraSig = {
  "雷公":    { name:"打雷",       type:"電",     power:110, category:"特殊" },
  "炎帝":    { name:"噴射火焰",   type:"火",     power:90,  category:"特殊" },
  "水君":    { name:"熱水",       type:"水",     power:80,  category:"特殊" },
  "烈空坐":  { name:"畫龍點睛",   type:"飛行",   power:120, category:"物理" },
  "蓋歐卡":  { name:"根源波動",   type:"水",     power:110, category:"特殊" },
  "固拉多":  { name:"斷崖之劍",   type:"地面",   power:120, category:"物理" },
  "帕路奇亞":{ name:"亞空裂斬",   type:"龍",     power:100, category:"特殊" },
  "騎拉帝納":{ name:"暗影強襲",   type:"幽靈",   power:100, category:"物理" },
  "萊希拉姆":{ name:"交錯火焰",   type:"火",     power:100, category:"特殊" },
  "捷克羅姆":{ name:"交錯閃電",   type:"電",     power:100, category:"特殊" },
  "酋雷姆":  { name:"冰封世界",   type:"冰",     power:65,  category:"特殊" },
  "哲爾尼亞斯":{ name:"幾何雪花", type:"妖精",   power:100, category:"特殊" },
  "伊裴爾塔爾":{ name:"死亡之翼", type:"飛行",   power:100, category:"特殊" },
};

for (var s in extraSig) { SIGNATURE_MOVES[s] = extraSig[s]; }

// ========== TYPE_MOVE_POOL EXTENSION ==========
// Add new moves to existing pools
TYPE_MOVE_POOL["草"]   = ["藤鞭","飛葉快刀","種子機關槍","種子炸彈","能量球","日光束","木角","打草結"];
TYPE_MOVE_POOL["火"]   = ["火花","火焰拳","噴射火焰","火焰踢","大字爆","閃焰衝鋒","熱風","魔法火焰"];
TYPE_MOVE_POOL["水"]   = ["水槍","水之尾","攀瀑","衝浪","水炮","熱水","潛水","濁流"];
TYPE_MOVE_POOL["電"]   = ["電擊","雷電拳","十萬伏特","打雷","放電","伏特交換","瘋狂伏特","電球"];
TYPE_MOVE_POOL["一般"] = ["撞擊","電光一閃","摔打","巨聲","破壞光線","終極衝擊","替身","守住"];
TYPE_MOVE_POOL["飛行"] = ["起風","翅膀攻擊","啄鑽","勇鳥猛攻","暴風","急轉彎","飛天","神鳥猛擊"];
TYPE_MOVE_POOL["格鬥"] = ["碎岩","空手劈","音速拳","子彈拳","近身戰","真氣彈","吸取拳","地球上投"];
TYPE_MOVE_POOL["蟲"]   = ["蟲咬","蟲鳴","十字剪","急速折返","超級角擊","飛彈針","信號光束"];
TYPE_MOVE_POOL["岩石"] = ["落石","岩崩","岩石封鎖","尖石攻擊","雙刃頭錘","岩石炮","隱形岩","岩石爆擊"];
TYPE_MOVE_POOL["幽靈"] = ["舌舔","暗影爪","暗影球","暗影偷襲","影子偷襲"];
TYPE_MOVE_POOL["龍"]   = ["龍捲風","龍之波動","龍爪","龍之舞","逆鱗","龍星群","時間咆哮"];
TYPE_MOVE_POOL["惡"]   = ["抓","暗襲要害","咬碎","突襲","欺詐","拋下狠話"];
TYPE_MOVE_POOL["鋼"]   = ["金屬爪","鐵頭","加農光炮","鐵尾","重磅衝撞","子彈拳","鐵蹄光線"];
TYPE_MOVE_POOL["妖精"] = ["妖精之風","魔法閃耀","月亮之力","嬉鬧","魔法火焰"];
TYPE_MOVE_POOL["超能力"] = ["念力","幻象光線","精神強念","預知未來","冥想","戲法空間","精神利刃"];
TYPE_MOVE_POOL["冰"]   = ["冰礫","冰凍拳","冰凍牙","冰凍光束","暴風雪","冰柱針"];
TYPE_MOVE_POOL["毒"]   = ["毒針","溶解液","污泥炸彈","垃圾射擊","十字毒刃","毒突","毒菱","劇毒"];
TYPE_MOVE_POOL["地面"] = ["潑沙","泥巴射擊","重踏","地震","直衝鑽","挖洞","斷崖之劍"];

// ========== SECOND WAVE: More missing Pokemon ==========
var addCommon2 = [
  {name:"懶人獺",evolutions:["過動猿","請假王"]},{name:"青綿鳥",evolutions:["七夕青鳥"]},
  {name:"怨影娃娃",evolutions:["詛咒娃娃"]},{name:"夜巡靈",evolutions:["彷徨夜靈","黑夜魔靈"]},
  {name:"雪童子",evolutions:["冰鬼護","雪妖女"]},{name:"正電拍拍"},{name:"負電拍拍"},
  {name:"勾魂眼"},{name:"大嘴娃"},{name:"阿勃梭魯"},{name:"聒噪鳥"},{name:"尖牙籠"},
  {name:"含羞苞",evolutions:["毒薔薇","羅絲雷朵"]},{name:"花岩怪"},
  {name:"圓蝌蚪",evolutions:["藍蟾蜍","蟾蜍王"]},{name:"黑眼鱷",evolutions:["混混鱷","流氓鱷"]},
  {name:"單首龍",evolutions:["雙首暴龍","三首惡龍"]},{name:"燃燒蟲",evolutions:["火神蛾"]},
  {name:"牙牙",evolutions:["斧牙龍","雙斧戰龍"]},{name:"扒手貓",evolutions:["酷豹"]},
  {name:"豆豆鴿",evolutions:["波波鴿","高傲雉雞"]},{name:"獨劍鞘",evolutions:["雙劍鞘","堅盾劍怪"]},
  {name:"好壞星",evolutions:["超壞星"]},{name:"弱小蟲",evolutions:["具甲武者"]},
  {name:"謎擬Q"},{name:"多龍梅西亞",evolutions:["多龍奇","多龍巴魯托"]},
  {name:"毒薔薇",evolutions:["羅絲雷朵"]},{name:"夢妖",evolutions:["夢妖魔"]},
  {name:"黑暗鴉",evolutions:["烏鴉頭頭"]},{name:"盔甲鳥"},{name:"天秤偶",evolutions:["念力土偶"]},
  {name:"觸手百合",evolutions:["搖籃百合"]},{name:"太古羽蟲",evolutions:["太古盔甲"]},
  {name:"可可多拉",evolutions:["可多拉","波士可多拉"]},{name:"墨海馬",evolutions:["海刺龍","刺龍王"]},
  {name:"海刺龍",evolutions:["刺龍王"]},{name:"大舌頭",evolutions:["大舌舔"]},
  {name:"獨角犀牛",evolutions:["鑽角犀獸","超鐵暴龍"]},{name:"鑽角犀獸",evolutions:["超鐵暴龍"]},
  {name:"蔓藤怪",evolutions:["巨蔓藤"]},{name:"飛天螳螂",evolutions:["巨鉗螳螂","劈斧螳螂"]},
  {name:"巨鉗螳螂"},{name:"劈斧螳螂"},{name:"電擊獸",evolutions:["電擊魔獸"]},{name:"鴨嘴火獸",evolutions:["鴨嘴炎獸"]},
  {name:"三合一磁怪",evolutions:["自爆磁怪"]},{name:"彷徨夜靈",evolutions:["黑夜魔靈"]},
  {name:"大嘴蝠",evolutions:["叉字蝠"]},{name:"臭臭花",evolutions:["美麗花"]},
  {name:"線球",evolutions:["阿利多斯"]},{name:"芭瓢蟲",evolutions:["安瓢蟲"]},
  {name:"尾立",evolutions:["大尾立"]},{name:"咕咕",evolutions:["貓頭夜鷹"]},
  {name:"土龍弟弟",evolutions:["土龍大爺"]},{name:"麒麟奇",evolutions:["奇麒麟"]},
  {name:"大蔥鴨",evolutions:["蔥遊兵"]},
];
var addRare2 = [
  {name:"菊石獸",evolutions:["多刺菊石獸"]},{name:"化石盔",evolutions:["鐳射盔"]},
  {name:"化石翼龍"},{name:"壺壺"},{name:"吉利蛋",evolutions:["幸福蛋"]},
  {name:"肯泰羅"},{name:"拉普拉斯"},{name:"卡比獸"},{name:"袋獸"},
  {name:"飛腿郎"},{name:"快拳郎"},{name:"大舌頭"},{name:"魔牆人偶"},
  {name:"迷唇姐"},{name:"大甲"},{name:"百變怪"},{name:"多邊獸",evolutions:["多邊獸Ⅱ","多邊獸Ｚ"]},
];
var addLegendary2 = [
  {name:"雷吉奇卡斯",legendary:true},{name:"克雷色利亞",legendary:true},
  {name:"達克萊伊",legendary:true},{name:"霏歐納",legendary:true},{name:"瑪納霏",legendary:true},
  {name:"謝米",legendary:true},{name:"比克提尼",legendary:true},
  {name:"美洛耶塔",legendary:true},{name:"凱路迪歐",legendary:true},
  {name:"蒂安希",legendary:true},{name:"胡帕",legendary:true},{name:"波爾凱尼恩",legendary:true},
  {name:"瑪機雅娜",legendary:true},{name:"瑪夏多",legendary:true},{name:"薩戮德",legendary:true},
  {name:"捷拉奧拉",legendary:true},
];
var extraTypes2 = {
  "懶人獺":["一般"],"過動猿":["一般"],"請假王":["一般"],
  "青綿鳥":["一般","飛行"],"七夕青鳥":["龍","飛行"],
  "怨影娃娃":["幽靈"],"詛咒娃娃":["幽靈"],
  "夜巡靈":["幽靈"],"彷徨夜靈":["幽靈"],"黑夜魔靈":["幽靈"],
  "雪童子":["冰"],"冰鬼護":["冰"],"雪妖女":["冰","幽靈"],
  "正電拍拍":["電"],"負電拍拍":["電"],
  "勾魂眼":["幽靈","惡"],"大嘴娃":["鋼","妖精"],"阿勃梭魯":["惡"],
  "聒噪鳥":["一般","飛行"],"尖牙籠":["草"],
  "含羞苞":["草","毒"],"毒薔薇":["草","毒"],"羅絲雷朵":["草","毒"],
  "花岩怪":["幽靈","惡"],
  "圓蝌蚪":["水"],"藍蟾蜍":["水","地面"],"蟾蜍王":["水","地面"],
  "黑眼鱷":["地面","惡"],"混混鱷":["地面","惡"],"流氓鱷":["地面","惡"],
  "單首龍":["惡","龍"],"雙首暴龍":["惡","龍"],"三首惡龍":["惡","龍"],
  "燃燒蟲":["蟲","火"],"火神蛾":["蟲","火"],
  "牙牙":["龍"],"斧牙龍":["龍"],"雙斧戰龍":["龍"],
  "扒手貓":["惡"],"酷豹":["惡"],
  "豆豆鴿":["一般","飛行"],"波波鴿":["一般","飛行"],"高傲雉雞":["一般","飛行"],
  "獨劍鞘":["鋼","幽靈"],"雙劍鞘":["鋼","幽靈"],"堅盾劍怪":["鋼","幽靈"],
  "好壞星":["毒","水"],"超壞星":["毒","水"],
  "弱小蟲":["蟲","水"],"具甲武者":["蟲","水"],
  "謎擬Q":["妖精","幽靈"],
  "多龍梅西亞":["龍","幽靈"],"多龍奇":["龍","幽靈"],"多龍巴魯托":["龍","幽靈"],
  "夢妖":["幽靈"],"夢妖魔":["幽靈"],
  "盔甲鳥":["鋼","飛行"],
  "天秤偶":["地面","超能力"],"念力土偶":["地面","超能力"],
  "刺龍王":["水","龍"],
  "大舌舔":["一般"],
  "超鐵暴龍":["地面","岩石"],
  "巨蔓藤":["草"],
  "巨鉗螳螂":["蟲","鋼"],
  "自爆磁怪":["電","鋼"],
  "叉字蝠":["毒","飛行"],
  "美麗花":["草"],
  "阿利多斯":["蟲","毒"],"安瓢蟲":["蟲","飛行"],
  "線球":["蟲"],"芭瓢蟲":["蟲"],
  "土龍大爺":["一般"],"奇麒麟":["一般","超能力"],
  "大尾立":["一般"],
  "貓頭夜鷹":["一般","飛行"],
  "多邊獸Ⅱ":["一般"],"多邊獸Ｚ":["一般"],
  "冰岩怪":["冰"],
  "火箭雀":["火","飛行"],"烈箭鷹":["火","飛行"],
  "小箭雀":["一般","飛行"],
  "掘掘兔":["一般"],"掘地兔":["一般","地面"],
  "捷拉奧拉":["電"],
  "棄世猴":["格鬥","幽靈"],
  "烈腿蝗":["蟲","惡"],
};
var extraMoves2 = {
  "波導彈":   { power: 80,  type: "格鬥",  category: "特殊", desc: "必定命中" },
  "惡之波動": { power: 80,  type: "惡",    category: "特殊", desc: "可能讓對手畏縮" },
  "龍之波動": { power: 85,  type: "龍",    category: "特殊", desc: "釋放龍之能量" },
  "大地之力": { power: 90,  type: "地面",  category: "特殊", desc: "可能降低特防" },
  "能量球":   { power: 90,  type: "草",    category: "特殊", desc: "可能降低特防" },
  "暗影球":   { power: 80,  type: "幽靈",  category: "特殊", desc: "可能降低特防" },
  "惡意追擊": { power: 60,  type: "惡",    category: "物理", desc: "對手已受傷則威力加倍" },
  "狂舞揮打": { power: 60,  type: "惡",    category: "物理", desc: "連續攻擊" },
  "洩憤":     { power: 75,  type: "惡",    category: "物理", desc: "能力下降則威力加倍" },
  "鱗射":     { power: 25,  type: "龍",    category: "物理", desc: "2~5次連續攻擊" },
  "龍錘":     { power: 90,  type: "龍",    category: "物理", desc: "用尖角撞擊" },
  "三旋擊":   { power: 20,  type: "冰",    category: "物理", desc: "連續攻擊3次" },
  "雙刃頭錘": { power: 150, type: "岩石",  category: "物理", desc: "反彈部分傷害" },
  "鐵滾輪":   { power: 130, type: "鋼",    category: "物理", desc: "移除場地狀態" },
  "撲擊":     { power: 80,  type: "格鬥",  category: "物理", desc: "防禦越高威力越大" },
  "靈魂衝擊": { power: 120, type: "妖精",  category: "特殊", desc: "澤爾尼亞斯的專屬招式" },
  "死亡之翼": { power: 100, type: "飛行",  category: "特殊", desc: "伊裴爾塔爾的專屬招式" },
  "制裁光礫": { power: 100, type: "一般",  category: "特殊", desc: "阿爾宙斯的專屬招式" },
  "滄海鳴奏": { power: 100, type: "水",    category: "特殊", desc: "蓋歐卡的專屬招式" },
  "大地恩惠": { power: 100, type: "地面",  category: "物理", desc: "固拉多的專屬招式" },
};
var extraSig2 = {
  "阿爾宙斯":{ name:"制裁光礫", type:"一般",   power:100, category:"特殊" },
  "捷拉奧拉":{ name:"等離子拳", type:"電",     power:100, category:"物理" },
  "蒼響":    { name:"巨獸斬",   type:"妖精",   power:100, category:"物理" },
  "藏瑪然特":{ name:"巨獸彈",   type:"格鬥",   power:100, category:"物理" },
  "無極汰那":{ name:"極巨炮",   type:"毒",     power:120, category:"特殊" },
};
// Merge second wave
POKEMON_TIERS["一般"] = dedupe(POKEMON_TIERS["一般"].concat(addCommon2));
POKEMON_TIERS["稀有"] = dedupe(POKEMON_TIERS["稀有"].concat(addRare2));
POKEMON_TIERS["傳說"] = dedupe(POKEMON_TIERS["傳說"].concat(addLegendary2));
for (var k2 in extraTypes2) { POKEMON_SPECIES_TYPES[k2] = extraTypes2[k2]; }
for (var m2 in extraMoves2) { MOVE_DATABASE[m2] = extraMoves2[m2]; }
for (var s2 in extraSig2) { SIGNATURE_MOVES[s2] = extraSig2[s2]; }

// ========== EVO_STAGE_MAP with alias support ==========
// Standalone evolved-form entries must NOT overwrite stages set by parent evolutions.
var EEVEELUTION_IBU = {
  "雷精靈":"雷伊布","水精靈":"水伊布","火精靈":"火伊布",
  "太陽精靈":"太陽伊布","月亮精靈":"月亮伊布",
  "葉精靈":"葉伊布","冰精靈":"冰伊布","仙子精靈":"仙子伊布"
};
EVO_STAGE_MAP = (function(){
  var m = {};
  for (var t in POKEMON_TIERS) {
    for (var i = 0; i < POKEMON_TIERS[t].length; i++) {
      var e = POKEMON_TIERS[t][i];
      if (m[e.name] === undefined) m[e.name] = 0;
      if (e.evolutions) {
        if (e.eevee) {
          for (var j = 0; j < e.evolutions.length; j++) { m[e.evolutions[j]] = 1; }
        } else {
          for (var j = 0; j < e.evolutions.length; j++) {
            m[e.evolutions[j]] = j + 1;
          }
        }
      }
    }
  }
  // Apply Eeveelution alias mapping (精靈 ↔ 伊布 naming)
  for (var _alias in EEVEELUTION_IBU) {
    var _ibu = EEVEELUTION_IBU[_alias];
    if (m[_ibu] !== undefined) m[_alias] = m[_ibu];
  }
  // EVO_STAGE_OVERRIDES: split evolutions whose chain index ≠ actual stage
  m["艾比郎"] = 1; m["柯波朗"] = 1;    // 巴爾郎 split — both direct evo (like 沙瓦郎)
  m["呆呆王"] = 1;                      // 呆呆獸 split — direct evo (like 呆殼獸)
  m["櫻花魚"] = 1;                      // 珍珠貝 split — direct evo (like 獵斑魚)
  m["伽勒爾呆呆王"] = 1;                // 伽勒爾呆呆獸 split
  m["雪妖女"] = 1;                      // 雪童子 split — direct evo (like 冰鬼護)
  m["艾路雷朵"] = 2;                    // 拉魯拉絲 chain — from 奇魯莉安 (like 沙奈朵)
  m["幸福蛋"] = 2;                      // 3-stage chain — overwritten by 吉利蛋's entry
  m["黑夜魔靈"] = 2;                    // 3-stage chain — overwritten by 彷徨夜靈's entry
  m["羅絲雷朵"] = 2;                    // 3-stage chain — overwritten by 毒薔薇's entry
  m["劈斧螳螂"] = 2;                    // 3-stage chain — overwritten by 巨鉗螳螂's entry
  return m;
})();

// ========== SPECIES GENERATION MAP ==========
var _GEN_NAMES = {};
function _addGen(arr, gen) {
  for (var i=0;i<arr.length;i++) _GEN_NAMES[arr[i]] = gen;
}
_addGen(["戴魯比","黑魯加","圖圖犬","大奶罐","果然翁","麒麟奇","榛果球","佛烈托斯","壺壺","土龍弟弟","布魯","布魯皇","千針魚","太陽珊瑚","鐵炮魚","章魚桶","信使鳥","巨翅飛魚","驚角鹿","巴爾郎","沙瓦郎","艾比郎","柯波朗","赫拉克羅斯","狃拉","瑪狃拉","熊寶寶","圈圈熊","小山豬","長毛豬","象牙豬","小小象","頓甲","咩利羊","茸茸羊","電龍","烏波","沼王","天然雀","天然鳥","呆呆魚","呆呆王","黑暗鴉","烏鴉頭頭","咕咕","貓頭夜鷹","尾立","大尾立","線球","阿利多斯","芭瓢蟲","安瓢蟲","樹才怪","奇麒麟","土龍大爺","大菊花","月桂葉","菊草葉","火球鼠","火岩鼠","火爆獸","火暴獸","小鋸鱷","藍鱷","大力鱷","雷公","炎帝","水君","雪拉比","小鴨嘴火龍","電擊怪","多邊獸Ⅱ","太陽精靈","月亮精靈","葉精靈","冰精靈","仙子精靈","幸福蛋","大針蜂","巴大蝶","大食花","毛球","末入蛾","派拉斯","派拉斯特","阿柏怪", "大嘴蝠", "叉字蝠", "蚊香君", "蚊香泳士", "牛蛙君","口呆花","隆隆石","隆隆岩","鬼斯通","耿鬼","臭臭花","霸王花","尼多娜","尼多后","尼多力諾","尼多王","勇基拉","胡地","豪力","怪力","烈焰馬","呆殼獸","三合一磁怪","大鋼蛇","刺甲貝","巨鉗蟹","頑皮雷彈","椰蛋樹","海刺龍","金魚王","寶石海星","暴鯉龍","嘟嘟利","白海獅","臭臭泥","素利拍","嘎啦嘎啦","雙彈瓦斯","鑽角犀獸","大比鳥","拉達","穿山王","哥達鴨","火爆猴","多刺菊石獸","鐳射盔","胖可丁","皮可西","皮寶寶","皮丘","貓老大","風速狗","雷丘","九尾"],2);
_addGen(["蘑蘑菇","斗笠菇","瑪沙那","恰雷姆","可可多拉","可多拉","波士可多拉","觸手百合","搖籃百合","太古羽蟲","太古盔甲","醜醜魚","美納斯","拉帝亞斯","拉帝歐斯","烈空坐","蓋歐卡","固拉多","基拉祈","代歐奇希斯","雷吉洛克","雷吉艾斯","雷吉斯奇魯","溶食獸","吞食獸","吼爆彈","爆音怪","向尾喵","優雅貓","幕下力士","鐵掌力士","刺尾蟲","甲殼蛹","狩獵鳳蝶","盾甲繭","毒粉蛾","橡實果","長鼻葉","狡猾天狗","蓮葉童子","蓮帽小童","樂天河童","龍蝦小兵","鐵螯龍蝦","大顎蟻","超音波幼蟲","沙漠蜻蜓","利牙魚","巨牙鯊","呆火駝","噴火駝","煤炭龜","跳跳豬","噗噗豬","晃晃斑","貓鼬斬","飯匙蛇","古空棘魚","海豹球","海魔獅","帝牙海獅","珍珠貝","獵斑魚","櫻花魚","愛心魚","泥泥鰍","鯰魚王","電螢蟲","甜甜螢","寶貝球菇","暴露菇","正電拍拍","負電拍拍","勾魂眼","大嘴娃","阿勃梭魯","聒噪鳥","尖牙籠","懶人獺","過動猿","請假王","青綿鳥","七夕青鳥","怨影娃娃","詛咒娃娃","夜巡靈","彷徨夜靈","黑夜魔靈","雪童子","冰鬼護","雪妖女","毒薔薇","含羞苞","羅絲雷朵","花岩怪","鐵啞鈴","金屬怪","巨金怪","小卡比獸","盆才怪","魔尼尼","小福蛋","銅鏡怪","青銅鐘","風鈴鈴","螢光魚","霓虹魚","夢妖","夢妖魔","天秤偶","念力土偶","盔甲鳥","美麗花","大舌舔","巨蔓藤","刺龍王","巨鉗螳螂","電擊魔獸","鴨嘴炎獸","自爆磁怪","超鐵暴龍","火稚雞","力壯雞","火焰雞","木守宮","森林蜥蜴","蜥蜴王","水躍魚","沼躍魚","巨沼怪","毒粉蛾","斗笠菇","恰雷姆","波士可多拉","大菊花","大力鱷","火爆獸","大鋼蛇", "刺龍王"],3);
_addGen(["波克比","波克基古","波克基斯","小火焰猴","猛火猴","烈焰猴","草苗龜","樹林龜","土台龜","波加曼","波皇子","帝王拿波","姆克兒","姆克鳥","姆克鷹","小貓怪","勒克貓","倫琴貓","由克希","艾姆利多","亞克諾姆","帝牙盧卡","帕路奇亞","騎拉帝納","席多藍恩","雷吉奇卡斯","克雷色利亞","達克萊伊","阿爾宙斯","霏歐納","瑪納霏","謝米","盾甲龍","護城龍","頭蓋龍","戰槌龍","泳圈鼬","浮潛鼬","圓法師","音箱蟬","無殼海兔","海兔獸","紫天蝎","龍王蠍","圓陸鯊","尖牙陸鯊","烈咬陸鯊","由基拉","沙基拉斯","班基拉斯","寶貝龍","甲殼龍","暴飛龍","利歐路","路卡利歐","拉魯拉絲","奇魯莉安","沙奈朵","艾路雷朵","黏黏寶","黏美兒","黏美龍","心鱗寶","鱗甲龍","杖尾鱗甲龍","多邊獸Ｚ","音箱蟀","倫琴貓","帝王拿波","土台龜","烈焰猴", "波克基斯", "艾路雷朵", "烈咬陸鯊", "暴飛龍", "路卡利歐", "沙奈朵", "班基拉斯"],4);
_addGen(["暖暖豬","炒炒豬","炎武王","藤藤蛇","青藤蛇","君主蛇","水水獺","雙刃丸","大劍鬼","駒刀小兵","劈斬司令","仆斬將軍","好啦魷","烏賊王","石丸子","地幔岩","龐岩怪","滾滾蝙蝠","心蝙蝠","螺釘地鼠","龍頭地鼠","搬運小匠","鐵骨土人","修建老匠","探探鼠","步哨鼠","小約克","哈約克","長毛狗","爆香猴","爆香猿","冷水猴","冷水猿","花椰猴","花椰猿","差不多娃娃","百足蜈蚣","車輪毬","蜈蚣王","象徵鳥","原蓋海龜","肋骨海龜","始祖小鳥","始祖大鳥","泥巴魚","麻麻小魚","麻麻鰻","麻麻鰻魚王","電電蟲","電蜘蛛","種子鐵球","堅果啞鈴","功夫鼬","師父鼬","赤面龍","小嘴蝸","敏捷蟲","蓋蓋蟲","騎士蝸牛","垃垃藻","毒拉蜜","鐵臂槍蝦","鋼炮臂蝦","哥德寶寶","哥德小童","哥德小姐","單卵細胞球","雙卵細胞球","人造細胞卵","保母蟲","索羅亞","索羅亞克","火紅不倒翁","達摩狒狒","黑眼鱷","混混鱷","流氓鱷","單首龍","雙首暴龍","三首惡龍","燃燒蟲","火神蛾","牙牙","斧牙龍","雙斧戰龍","扒手貓","酷豹","豆豆鴿","波波鴿","高傲雉雞","獨劍鞘","雙劍鞘","堅盾劍怪","勇士雄鷹","奇諾栗鼠","圓蝌蚪","藍蟾蜍","蟾蜍王","勾帕路翁","代拉基翁","畢力吉翁","凱路迪歐","雷希拉姆","捷克羅姆","酋雷姆","土地雲","龍捲雲","雷電雲","美洛耶塔","比克提尼","火爆猴","棄世猴","大劍鬼","君主蛇","炎武王","蜈蚣王","龍頭地鼠","修建老匠","三首惡龍","雙斧戰龍","水晶燈火靈", "人造細胞卵", "堅盾劍怪"],5);
_addGen(["小箭雀","火箭雀","烈箭鷹","掘掘兔","掘地兔","呱呱泡蛙","呱頭蛙","甲賀忍蛙","哈力栗","胖胖哈力","布里卡隆","火狐狸","長尾火狐","妖火紅狐","妙喵","超能妙喵","嗡蝠","音波龍","哲爾尼亞斯","伊裴爾塔爾","基格爾德","蒂安希","胡帕","波爾凱尼恩","冰岩怪","洗翠冰岩怪","燈火幽靈","水晶燈火靈","燭光靈"],6);
_addGen(["毒貝比","四顎針龍","童偶熊","穿著熊","睡睡菇","燈罩夜菇","岩狗狗","鬃岩狼人","好勝蟹","好勝毛蟹","花舞鳥","萌虻","蝶結萌虻","沙丘娃","噬沙堡爺","爆焰龜獸","托戈德瑪爾","磨牙彩皮魚","老翁龍","破破舵輪","蟲電寶","鍬農炮蟲","滴蛛","滴蛛霸","偽螳草","蘭螳花","夜盜火蜥","焰后蜥","重泥挽馬","小篤兒","喇叭啄鳥","銃嘴大鳥","貓鼬探長","好壞星","超壞星","弱小蟲","具甲武者","謎擬Q","狙射樹梟","捷拉奧拉","卡璞・鳴鳴","卡璞・蝶蝶","卡璞・哞哞","卡璞・鰭鰭","科斯莫古","科斯莫姆","索爾迦雷歐","露奈雅拉","奈克洛茲瑪","瑪機雅娜","紙御劍","鐵火輝夜","虛吾伊德","爆肌蚊","費洛美螂","電束木","惡食大王","壘磊石","砰頭小丑","瑪夏多","阿羅拉穿山鼠","阿羅拉穿山王","阿羅拉六尾","阿羅拉九尾","阿羅拉小拉達","阿羅拉拉達","阿羅拉地鼠","阿羅拉三地鼠","阿羅拉喵喵","阿羅拉貓老大","阿羅拉嘎啦嘎啦","阿羅拉雷丘","阿羅拉臭泥","阿羅拉臭臭泥","木木梟","投羽梟","狙射樹梟","火斑喵","炎熱喵","熾焰咆哮虎","球海獅","花漾海獅","西獅海壬"],7);
_addGen(["拳拳蛸","八爪武師","毒電嬰","顫弦蠑螈","咬咬龜","暴噬龜","索偵蟲","天罩蟲","以歐路普","來電汪","逐電犬","愛管侍","稚山雀","藍鴉","鋼鎧鴉","貪心栗鼠","藏飽栗鼠","偷兒狐","狐大盜","淚眼蜥","變澀蜥","千面避役","敲音猴","啪咚猴","轟擂金剛猩","炎兔兒","騰蹴小將","閃焰王牌","列陣兵","啪嚓海膽","冰砌鵝","莫魯貝可","雪吞蟲","雪絨蛾","啃果蟲","蘋裹龍","豐蜜龍","小仙奶","霜奶仙","多龍梅西亞","多龍奇","多龍巴魯托","蒼響","藏瑪然特","無極汰那","熊徒弟","武道熊師","雷吉艾勒奇","雷吉鐸拉戈","雪暴馬","靈幽馬","蕾冠王","薩戮德","伽勒爾喵喵","喵頭目","伽勒爾蛇紋熊","伽勒爾直衝熊","堵攔熊","伽勒爾雙彈瓦斯","伽勒爾大蔥鴨","蔥遊兵","伽勒爾呆呆獸","伽勒爾呆殼獸","伽勒爾呆呆王","伽勒爾火紅不倒翁","伽勒爾達摩狒狒","洗翠霹靂電球","洗翠頑皮雷彈","洗翠索羅亞","洗翠索羅亞克","洗翠卡蒂狗","洗翠風速狗","洗翠勇士雄鷹","洗翠火暴獸","洗翠大劍鬼","洗翠狙射樹梟","洗翠黏美龍","洗翠冰岩怪","洗翠千面避役","劈斧螳螂","月月熊","幽尾玄魚","大狃拉","萬針魚","眷戀雲","詭角鹿","以歐路普","蛇紋熊","直衝熊","勇士雄鷹","火暴獸","大劍鬼","狙射樹梟","黏美龍","鋼鎧鴉","千面避役","閃焰王牌","轟擂金剛猩"],8);
_addGen(["呆火鱷","炙燙鱷","骨紋巨聲鱷","新葉喵","蒂蕾喵","魔幻假面喵","潤水鴨","湧躍鴨","狂歡浪舞鴨","小鍛匠","巧鍛匠","巨鍛匠","迷你芙","奧利紐","奧利瓦","團珠蛇","沙鐵皮","光蚪仔","電肚蛙","燭光靈","燈火幽靈","水晶燈火靈","提布莉姆","長毛巨魔","故勒頓","密勒頓","厄鬼椪","太樂巴戈斯","古簡蝸","古劍豹","古鼎鹿","古玉魚","轟鳴月","鐵武者","振翼髮","猛惡菇","爬地翅","鐵毒蛾","鐵荊棘","鐵頭殼","鐵臂膀","鐵捆子","吉雉雞","夠讚狗","願增猿","桃歹郎","丹瑜","烏栗","帕底亞肯泰羅","猴怪","火爆猴","棄世猴","布撥","布土撥","巴布土撥","豆蟋蟀","烈腿蝗","電海燕","大電海燕","愛管侍","狠辣椒","蟲甲聖","拔沙","普隆隆姆","摩托蜥","拖拖蚓","雄偉牙","鐵轍跡","吼叫尾","沙鐵皮","猛惡菇","振翼髮","爬地翅","轟鳴月","鐵武者","鐵毒蛾","鐵荊棘","鐵頭殼","鐵臂膀","鐵捆子"],9);
// Build SPECIES_GENERATION from all POKEMON_TIERS entries (global)
window.SPECIES_GENERATION = {};
for (var _gt in POKEMON_TIERS) {
  for (var _gi=0; _gi<POKEMON_TIERS[_gt].length; _gi++) {
    var _ge = POKEMON_TIERS[_gt][_gi];
    window.SPECIES_GENERATION[_ge.name] = _GEN_NAMES[_ge.name] || 1;
    if (_ge.evolutions) {
      for (var _gj=0; _gj<_ge.evolutions.length; _gj++) {
        if (!window.SPECIES_GENERATION[_ge.evolutions[_gj]]) {
          window.SPECIES_GENERATION[_ge.evolutions[_gj]] = _GEN_NAMES[_ge.evolutions[_gj]] || 1;
        }
      }
    }
  }
}
// Region helpers (global)
window.REGION_GENS = { "關都":[1], "城都":[2], "豐緣":[3], "神奧":[4], "合眾":[5,6,7,8,9], "卡洛斯":[6] };
window.REGION_NAMES = ["關都","城都","豐緣","神奧","合眾","卡洛斯"];
// Curated regional common pools (~50 species per region, non-legendary roadside encounters)
window.REGION_COMMON_POOLS = {
  "關都":["波波","烈雀","小拉達","胖丁","皮皮","走路草","喇叭芽","派拉斯","毛球","地鼠","喵喵","可達鴨","猴怪","卡蒂狗","蚊香蝌蚪","凱西","腕力","小拳石","瑪瑙水母","大舌貝","鬼斯","大岩蛇","雷電球","蛋蛋","卡拉卡拉","大蔥鴨","嘟嘟","墨海馬","海星星","鯉魚王","伊布","百變怪","多邊獸","菊石獸","化石盔","魔牆人偶","飛天螳螂","大鉗蟹","臭泥","小磁怪","大食花","口呆花","尼多蘭","尼多朗","六尾","穿山鼠","皮卡丘","雷精靈","水精靈","火精靈"],
  "城都":["咕咕","尾立","土狼犬","蛇紋熊","戴魯比","布魯","千針魚","壺壺","麒麟奇","驚角鹿","圖圖犬","大奶罐","果然翁","榛果球","太陽珊瑚","鐵炮魚","章魚桶","信使鳥","巨翅飛魚","咩利羊","烏波","天然雀","黑暗鴉","線球","芭瓢蟲","樹才怪","熊寶寶","小山豬","小小象","巴爾郎","赫拉克羅斯","狃拉","燈籠魚","毽子草","向日種子","蜻蜻蜓","駒刀小兵","火球鼠","小鋸鱷","菊草葉","電擊怪","小鴨嘴火龍","大鋼蛇","刺甲貝","叉字蝠","幸福蛋","佛烈托斯","安瓢蟲","阿利多斯"],
  "合眾":["姆克兒","小貓怪","泳圈鼬","圓陸鯊","利歐路","拉魯拉絲","小火焰猴","草苗龜","波加曼","圓法師","無殼海兔","紫天蝎","寶貝龍","由基拉","黏黏寶","心鱗寶","頭蓋龍","盾甲龍","大牙狸","波克比","魔尼尼","銅鏡怪","螢光魚","天秤偶","夢妖","鐵啞鈴","可可多拉","青綿鳥","雪童子","怨影娃娃","夜巡靈","毒薔薇","溶食獸","吼爆彈","向尾喵","幕下力士","龍蝦小兵","大顎蟻","利牙魚","呆火駝","煤炭龜","跳跳豬","晃晃斑","貓鼬斬","飯匙蛇","海豹球","呆火鱷","潤水鴨","新葉喵","布撥"],
  "卡洛斯":["小箭雀","掘掘兔","呱呱泡蛙","哈力栗","火狐狸","妙喵","嗡蝠","燭光靈","獨劍鞘","垃垃藻","鐵臂槍蝦","花潔夫人","粉蝶蟲","鑰圈兒","龜腳腳","胖胖哈力","妖火紅狐","音波龍","烈箭鷹","掘地兔","睡睡菇","燈罩夜菇","岩狗狗","鬃岩狼人","好勝蟹","好勝毛蟹","花舞鳥","萌虻","蝶結萌虻","沙丘娃","噬沙堡爺","爆焰龜獸","托戈德瑪爾","磨牙彩皮魚","毒貝比","童偶熊","穿著熊","好壞星","超壞星","偽螳草","蘭螳花","夜盜火蜥","焰后蜥","重泥挽馬","小篤兒","喇叭啄鳥","銃嘴大鳥","貓鼬探長","滴蛛","滴蛛霸"]
};
window.getRegionPool = function(region) {
  // Prefer curated pool, fall back to generation-based filtering
  var curated = window.REGION_COMMON_POOLS[region];
  if (curated && curated.length > 0) {
    var all = [];
    for (var _ct in POKEMON_TIERS) {
      for (var _ci=0; _ci<POKEMON_TIERS[_ct].length; _ci++) {
        var _ce = POKEMON_TIERS[_ct][_ci];
        if (curated.indexOf(_ce.name) !== -1) all.push(_ce);
      }
    }
    return all;
  }
  var gens = window.REGION_GENS[region] || [1];
  var pool = [];
  for (var _rt in POKEMON_TIERS) {
    for (var _ri=0; _ri<POKEMON_TIERS[_rt].length; _ri++) {
      var _re = POKEMON_TIERS[_rt][_ri];
      var gen = window.SPECIES_GENERATION[_re.name] || 1;
      if (gens.indexOf(gen) !== -1) pool.push(_re);
    }
  }
  return pool;
};
console.log("[Gen2~9] Loaded: 一般="+POKEMON_TIERS["一般"].length+" 稀有="+POKEMON_TIERS["稀有"].length+" 傳說="+POKEMON_TIERS["傳說"].length+" 屬性="+Object.keys(POKEMON_SPECIES_TYPES).length+" 招式="+Object.keys(MOVE_DATABASE).length);
})();
