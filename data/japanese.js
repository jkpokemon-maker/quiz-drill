// Japanese grammar nuances (N1). Question shape:
//   { id, topic, type: 'mc', prompt, choices: [...], answer: <index of correct choice>, explanation }
// Keep ids stable: progress is stored by id.
(function () {
  const Q = (window.QUIZ = window.QUIZ || { questions: [], generators: [] });
  const subject = 'japanese';
  const add = (topic, list) => list.forEach(q => Q.questions.push(Object.assign({ subject, topic, type: 'mc' }, q)));

  add('N1文型', [
    {
      id: 'ja-001',
      prompt: '台風の影響で、決勝戦は延期を（　）。',
      choices: ['余儀なくされた', '禁じ得なかった', '皮切りにした', '極まりなかった'],
      answer: 0,
      explanation: '〜を余儀なくされる = to be forced into something by circumstances beyond one\'s control. It takes a noun of action (延期・中止・撤退を余儀なくされる).\n〜を禁じ得ない is for involuntary emotions (涙・同情・怒りを禁じ得ない). 〜極まりない follows na-adjectives (失礼極まりない).',
    },
    {
      id: 'ja-002',
      prompt: '被災地の惨状を目の当たりにして、涙を（　）。',
      choices: ['禁じ得なかった', '余儀なくされた', 'もってしても', '限りだった'],
      answer: 0,
      explanation: '〜を禁じ得ない = cannot suppress (a feeling). Used with emotion nouns: 涙・同情・驚き・怒り. Formal, written register.\n〜を余儀なくされる is about being forced into an action, not a feeling.',
    },
    {
      id: 'ja-003',
      prompt: '夢の舞台に立た（　）、彼は寝る間も惜しんで練習を重ねた。',
      choices: ['んがため', 'んばかりに', 'まいとして', 'ずじまいで'],
      answer: 0,
      explanation: '〜んがため(に) = in order to (literary, strong will). Attaches to the ない-stem: 立たんがため, 勝たんがため; する → せんがため.\n〜まいとして = trying NOT to — the opposite meaning here.',
    },
    {
      id: 'ja-004',
      prompt: '彼は今にも泣き出さ（　）表情で、無実を訴えた。',
      choices: ['んばかりの', 'んがための', 'ずじまいの', 'ないまでも'],
      answer: 0,
      explanation: '〜んばかり(の/に) = as if about to ~ (it almost happens but doesn\'t). 泣き出さんばかりの表情, 溢れんばかりの笑顔.\nAttaches to the ない-stem, like んがため, but expresses appearance, not purpose.',
    },
    {
      id: 'ja-005',
      prompt: '皆様のますますのご活躍を、心より願って（　）。',
      choices: ['やみません', 'なりません', 'たまりません', 'かないません'],
      answer: 0,
      explanation: '〜てやまない = to continually and sincerely (wish/hope/love). Fixed with 願う・祈る・期待する・愛する; typical of speeches and formal letters.\n〜てならない / 〜てたまらない describe feelings welling up spontaneously (気がしてならない, 心配でたまらない) and don\'t combine with 願う like this.',
    },
    {
      id: 'ja-006',
      prompt: '残念ながら、彼の証言は信頼する（　）ものではない。',
      choices: ['に足る', 'に堪えない', 'にかたくない', 'までもない'],
      answer: 0,
      explanation: '〜に足る = worthy of / sufficient for (信頼するに足る人物, 一読に足る本).\n〜に堪えない = too painful to (聞くに堪えない) — opposite polarity. 〜にかたくない pairs with 想像・察する. 〜までもない = no need to.',
    },
    {
      id: 'ja-007',
      prompt: '震災直後の被災者の苦しみは、想像（　）。',
      choices: ['にかたくない', 'に足る', 'に即している', 'の極みだ'],
      answer: 0,
      explanation: '〜にかたくない = it is not hard to (imagine/infer). Essentially fixed with 想像・察する・理解: 想像にかたくない, 察するにかたくない.',
    },
    {
      id: 'ja-008',
      prompt: 'この難局を乗り切れるのは、彼（　）ほかにいない。',
      choices: ['をおいて', 'をよそに', 'をもって', 'を限りに'],
      answer: 0,
      explanation: 'Xをおいて（ほかに）〜ない = no one/nothing other than X. Strong praise of X as the only option.\nをもって = by means of / as of (本日をもって). を限りに = as the last time (今日を限りに禁煙する).',
    },
    {
      id: 'ja-009',
      prompt: '東京公演（　）、全国20都市を回るツアーが始まる。',
      choices: ['を皮切りに', 'を限りに', 'をもって', 'をよそに'],
      answer: 0,
      explanation: '〜を皮切りに = starting with X (and continuing with a series). Used when one event is the first of many.\nを限りに marks an end point, not a start.',
    },
    {
      id: 'ja-010',
      prompt: '毎日とは言わ（　）、せめて週に一度は運動したほうがいい。',
      choices: ['ないまでも', 'ずじまいで', 'んばかりに', 'ずにはおかず'],
      answer: 0,
      explanation: '〜ないまでも = even if not (to the full extent of X), at least ~. Often followed by せめて / 少なくとも: 毎日とは言わないまでも、週に一度は….',
    },
    {
      id: 'ja-011',
      prompt: '楽しみにしていた展覧会だったが、忙しくて結局行か（　）だった。',
      choices: ['ずじまい', 'ずにはおかない', 'んがため', 'ないまでも'],
      answer: 0,
      explanation: '〜ずじまい = ended up never doing (an opportunity passed), usually with regret: 行かずじまい, 聞かずじまい, 会えずじまい.',
    },
    {
      id: 'ja-012',
      prompt: '彼は何事も悲観的に考える（　）。',
      choices: ['きらいがある', 'おそれがある', 'までもない', 'に越したことはない'],
      answer: 0,
      explanation: '〜きらいがある = has a (bad) tendency to. Describes a habitual trait, usually critically.\n〜おそれがある = there is a risk that (a bad event) may happen — news/official register, not a personal habit.',
    },
    {
      id: 'ja-013',
      prompt: '言う（　）、安全は何よりも優先される。',
      choices: ['までもなく', 'にかたくなく', 'に足らず', 'べくもなく'],
      answer: 0,
      explanation: '言うまでもなく = needless to say. 〜までもない = there\'s no need to go as far as ~ (it\'s obvious).',
    },
    {
      id: 'ja-014',
      prompt: '「待ってました」（　）、彼は勢いよく手を挙げた。',
      choices: ['とばかりに', 'ともなく', 'とあって', 'といえども'],
      answer: 0,
      explanation: '〜とばかりに = as if to say "~" — a feeling shown through action without being said. Not used for the speaker\'s own actions.',
    },
    {
      id: 'ja-015',
      prompt: '新しい事業を立ち上げる（　）、彼は資金集めに奔走している。',
      choices: ['べく', 'べからず', 'べくもなく', 'べきで'],
      answer: 0,
      explanation: '〜べく = in order to (formal). する → すべく/するべく. The main clause can\'t be a request or command (×行くべく、来てください).\nべからず = must not (signs: 立ち入るべからず). べくもない = cannot possibly (望むべくもない).',
    },
    {
      id: 'ja-016',
      prompt: '素人の私には、プロのような技術など望む（　）。',
      choices: ['べくもない', 'べからず', 'べく', 'べきだ'],
      answer: 0,
      explanation: '〜べくもない = there is no way one could ~ (impossible from the start). Mostly with 望む・知る・比べる: 知るべくもない, 比べるべくもない.',
    },
  ]);

  add('紛らわしい表現', [
    {
      id: 'ja-101',
      prompt: '親の心配を（　）、息子は毎晩遅くまで遊び歩いている。',
      choices: ['よそに', 'ものともせず', 'おいて', '皮切りに'],
      answer: 0,
      explanation: '〜をよそに = paying no attention to (others\' worry, expectations, criticism). Often carries the speaker\'s disapproval.\n〜をものともせず = undeterred by (a hardship or danger) — admiring. It doesn\'t fit someone ignoring their parents to party.',
    },
    {
      id: 'ja-102',
      prompt: '足の怪我を（　）、彼女は最後まで走り抜いた。',
      choices: ['ものともせず', 'よそに', 'いいことに', '限りに'],
      answer: 0,
      explanation: '〜をものともせず = not letting (an obstacle: 怪我・嵐・逆境・困難) stop you. Admiring nuance, used about someone else.\n〜をよそに takes people\'s feelings or surrounding situations (心配・期待・批判), not physical obstacles. 〜をいいことに = taking (improper) advantage of.',
    },
    {
      id: 'ja-103',
      prompt: 'この映画は、観る者の心を揺さぶら（　）。',
      choices: ['ずにはおかない', 'ずにはいられない', 'ないではすまない', 'ざるを得ない'],
      answer: 0,
      explanation: '〜ずにはおかない: the subject (often a thing or work) inevitably causes an effect in people — 人を感動させずにはおかない. It can also express a person\'s firm resolve.\n〜ずにはいられない is the speaker\'s own irrepressible urge. 〜ずにはすまない = it won\'t be acceptable without ~ (social obligation).',
    },
    {
      id: 'ja-104',
      prompt: 'あの場面を見たら、誰だって笑わ（　）だろう。',
      choices: ['ずにはいられない', 'ずにはおかない', 'ずにはすまない', 'ずじまい'],
      answer: 0,
      explanation: '〜ずにはいられない = can\'t help ~ing. A personal, spontaneous urge (笑う・泣く・言う).\nCompare 〜ずにはおかない (a cause produces an effect on others) and 〜ずにはすまない (obligation: 謝らずにはすまない).',
    },
    {
      id: 'ja-105',
      prompt: '連休（　）、どこの観光地も大変な人出だ。',
      choices: ['とあって', 'とあれば', 'ともなく', 'といえども'],
      answer: 0,
      explanation: '〜とあって = because of (a special situation), describing an observed result. Not used for the speaker\'s own will.\n〜とあれば = if it\'s (for X / the case that X), then (I\'ll do anything) — a hypothetical condition.',
    },
    {
      id: 'ja-106',
      prompt: '愛する家族のため（　）、どんな苦労もいとわない。',
      choices: ['とあれば', 'とあって', 'ともなると', 'とばかりに'],
      answer: 0,
      explanation: '〜のためとあれば = if it is for the sake of ~ — fixed pattern expressing willingness to do anything. A condition, so とあって (a factual cause) doesn\'t fit.',
    },
    {
      id: 'ja-107',
      prompt: '社長（　）、一つ一つの決断の重みも違ってくる。',
      choices: ['ともなれば', 'ともなく', 'とばかりに', 'といえども'],
      answer: 0,
      explanation: '〜ともなれば / ともなると = once one reaches the level/position of X, things change naturally (大学生ともなれば, 社長ともなると).\n〜といえども = even though X (sets up a contrast against expectation).',
    },
    {
      id: 'ja-108',
      prompt: 'プロの選手（　）、ミスをすることはある。',
      choices: ['といえども', 'ともなれば', 'とあって', 'ならでは'],
      answer: 0,
      explanation: '〜といえども = even X (contrary to what you\'d expect of X). プロといえども、ミスはある.\nともなれば would set up "once you\'re a pro, naturally…", which clashes with making mistakes. ならでは = unique to X (needs の + noun).',
    },
    {
      id: 'ja-109',
      prompt: '一言相談してくれれば手伝った（　）、どうして一人で抱え込んだのか。',
      choices: ['ものを', 'ものの', 'ものなら', 'もので'],
      answer: 0,
      explanation: '〜ものを = (I would have…) and yet — regret or reproach about something that didn\'t happen. ≈ のに but more literary.\nものの = although (a fact). ものなら = if (unlikely) one could ~. もので = because (an excuse, conversational).',
    },
    {
      id: 'ja-110',
      prompt: 'できる（　）、もう一度学生時代に戻りたい。',
      choices: ['ものなら', 'ものを', 'ものの', 'ものだから'],
      answer: 0,
      explanation: '〜ものなら = if it were possible to ~ (unlikely): 戻れるものなら戻りたい. With volitional form (〜ようものなら) it warns of a bad result: 遅刻しようものなら、大変なことになる.',
    },
    {
      id: 'ja-111',
      prompt: 'この工芸品は、細部（　）こだわり抜いて作られている。',
      choices: ['に至るまで', 'に至っては', 'に至って', 'をもって'],
      answer: 0,
      explanation: '〜に至るまで = even down to / all the way to (the extreme end of a range). 細部に至るまで, 子供から大人に至るまで.\n〜に至っては singles out an extreme example of something negative (see the next question).',
    },
    {
      id: 'ja-112',
      prompt: '兄も勉強嫌いだが、弟（　）教科書を開いたことすらない。',
      choices: ['に至っては', 'に至るまで', 'にひきかえ', 'にもまして'],
      answer: 0,
      explanation: '〜に至っては = as for X (the most extreme case), usually negative. It follows a general statement (兄も…) and singles out the worst example.\nにひきかえ = in contrast to. にもまして = even more than.',
    },
    {
      id: 'ja-113',
      prompt: '子供は子供（　）、親のことを気遣っているのだ。',
      choices: ['なりに', 'なり', 'ならでは', 'がてら'],
      answer: 0,
      explanation: 'XはXなりに = in X\'s own way (within its limits). 子供なりに考えた, 私なりに努力した.\nなり (after a verb in dictionary form) = as soon as — a different pattern.',
    },
    {
      id: 'ja-114',
      prompt: '彼は部屋に入る（　）、ソファに倒れ込んだ。',
      choices: ['なり', 'なりに', 'そばから', 'かたわら'],
      answer: 0,
      explanation: '〜なり = the moment (A), (B, an unexpected action) happened. Third-person subject, same subject for A and B, and B is not a command or intention.\nOther options for "as soon as": が早いか / や否や (more literary).',
    },
    {
      id: 'ja-115',
      prompt: '覚えた（　）忘れてしまうので、単語の暗記は本当に苦手だ。',
      choices: ['そばから', 'が早いか', 'なり', 'かたわら'],
      answer: 0,
      explanation: '〜そばから = no sooner do I ~ than (it\'s undone) — a repeated, frustrating pattern. 片付けるそばから散らかす.\nが早いか / なり describe a single event, not a habitual cycle.',
    },
    {
      id: 'ja-116',
      prompt: '散歩（　）、駅前の本屋に寄ってみた。',
      choices: ['がてら', 'かたわら', 'なり', 'そばから'],
      answer: 0,
      explanation: '〜がてら = while doing A, also take the chance to do B. Short-term, casual (散歩がてら, 買い物がてら).\n〜かたわら = alongside (a main occupation), a long-term parallel activity.',
    },
    {
      id: 'ja-117',
      prompt: '彼は会社勤めの（　）、週末は小説を書いている。',
      choices: ['かたわら', 'がてら', 'ついで', 'ながらに'],
      answer: 0,
      explanation: '〜かたわら = besides (one\'s main work), also engaged in another activity long-term. Nの + かたわら / V-dict + かたわら.\nがてら is for one-off errands, and doesn\'t take の here.',
    },
    {
      id: 'ja-118',
      prompt: '規則違反は、理由の（　）、一切認められない。',
      choices: ['いかんを問わず', 'いかんでは', 'いかにも', 'いかんせん'],
      answer: 0,
      explanation: 'Nのいかんを問わず / いかんによらず = regardless of N.\nNのいかんでは / いかんによっては = depending on N. いかんせん = unfortunately, there\'s nothing to be done.',
    },
    {
      id: 'ja-119',
      prompt: '面接の結果（　）、採用が見送られることもある。',
      choices: ['いかんによっては', 'いかんを問わず', 'いかにも', 'いかんせん'],
      answer: 0,
      explanation: 'Nいかんによっては = depending on N (a particular outcome is possible). Opposite stance to いかんを問わず (regardless of N).',
    },
  ]);

  add('は・が', [
    {
      id: 'ja-201',
      prompt: 'A「この中で誰が一番背が高いの？」\nB「田中さん（　）一番高いよ。」',
      choices: ['が', 'は', 'も', 'を'],
      answer: 0,
      explanation: 'An answer to a question word (誰が) keeps が: it marks the new, focused information ("it\'s Tanaka who…", exhaustive listing).\n田中さんは would treat Tanaka as the known topic and imply a contrast with others.',
    },
    {
      id: 'ja-202',
      prompt: '私（　）昨日作ったケーキ、もう食べた？',
      choices: ['が', 'は', 'を', 'で'],
      answer: 0,
      explanation: 'Inside a noun-modifying clause (私が作ったケーキ) the subject takes が (or の), not は. は would attach to the whole sentence, not the clause.',
    },
    {
      id: 'ja-203',
      prompt: '（窓の外を見て）「あ、雨（　）降ってきた。」',
      choices: ['が', 'は', 'を', 'も'],
      answer: 0,
      explanation: '現象文: describing a newly perceived event as it is uses が. 雨は降ってきた would sound contrastive ("the rain, at least, has started…").',
    },
    {
      id: 'ja-204',
      prompt: 'ビールは飲みますが、ワイン（　）あまり飲みません。',
      choices: ['は', 'が', 'も', 'を'],
      answer: 0,
      explanation: 'Contrastive は: two topics set against each other (ビールは… ワインは…). も would mean "also", which contradicts the first clause.',
    },
  ]);

  add('敬語', [
    {
      id: 'ja-301',
      prompt: '（取引先からの電話で）「申し訳ございません。部長の山田は、ただいま（　）。」',
      choices: ['席を外しております', '席を外していらっしゃいます', 'お出かけになっています', '席をお外しです'],
      answer: 0,
      explanation: 'ウチ・ソト: when speaking to someone outside the company, members of your own company take humble/polite forms, not 尊敬語. Even the 部長 is referred to without さん (部長の山田は…).',
    },
    {
      id: 'ja-302',
      prompt: '次のうち、二重敬語として不適切とされる表現はどれか。',
      choices: ['おっしゃられる', 'おっしゃる', 'お話しになる', '言われる'],
      answer: 0,
      explanation: 'おっしゃる is already 尊敬語, so adding 〜られる doubles it (二重敬語).\nSome double forms are accepted by custom (慣例): お召し上がりになる, お伺いする.',
    },
    {
      id: 'ja-303',
      prompt: '（お客様に）「先日お送りした資料は、もう（　）か。」',
      choices: ['ご覧になりました', '拝見されました', '拝見しました', 'ご覧しました'],
      answer: 0,
      explanation: 'The customer is the one looking, so use 尊敬語: ご覧になる.\n拝見する is 謙譲語 (your own action); 拝見される wrongly mixes humble and respectful forms. ご覧する isn\'t a valid form.',
    },
  ]);
})();
