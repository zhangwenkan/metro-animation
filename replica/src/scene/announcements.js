/**
 * 车内广播文案（对应站点 chunk 里的 FO）
 * 两段轮播：先是猫的免责声明，之后是车站播报，间隔 60~100 秒随机。
 * 每条 cue 用音频内的起始秒数对齐字幕。
 */
export const ANNOUNCEMENTS = {
  cat: {
    title: "About Ajo",
    file: "/assets/train/audio/cat-disclaimer.ogg",
    cues: [
      { start: 0, ja: "お客様にご案内いたします。", en: "May we have your attention, please." },
      {
        start: 2.65,
        ja: "車内におります人型の猫は、アホです。",
        en: "The humanoid cat in this carriage is Ajo.",
      },
      {
        start: 6.55,
        ja: "通常のことですので、特にご対応いただく必要はございません。",
        en: "This is normal and requires no special action.",
      },
      {
        start: 11.51,
        ja: "有効な乗車券を所持しておりますので、座席もご利用いただけます。",
        en: "He holds a valid ticket and is entitled to use the seats.",
      },
    ],
  },
  general: {
    title: "Next stop",
    file: "/assets/train/audio/station-announcement.ogg",
    cues: [
      { start: 0, ja: "次は、静岡。静岡です。", en: "Next is Shizuoka. Shizuoka." },
      {
        start: 3.68,
        ja: "お降りのお客様は、お忘れ物のないようご注意ください。",
        en: "Passengers leaving the train, please make sure you have all your belongings.",
      },
    ],
  },
};
