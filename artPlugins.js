window.artPlugins = window.artPlugins || function(t) {
    var e = {
        version: "1.1.7",
        init: t => Promise.all([e.readyHls(), e.readyArtplayer(), e.readySupported()]).then(() => e.initArtplayer(t)),
        readyHls: () => {
            return window.Hls || unsafeWindow.Hls ? Promise.resolve() : e.loadJs("https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.14/hls.min.js")
        },
        readyArtplayer: () => {
            return window.Artplayer || unsafeWindow.Artplayer ? Promise.resolve() : e.loadJs("https://cdnjs.cloudflare.com/ajax/libs/artplayer/5.2.2/artplayer.min.js")
        },
        readySupported: () => Promise.resolve(t).then(t => {
            const { version: o } = e,
                n = GM_getValue("art-" + o, 0),
                a = t.reduce((t, e) => t + e.toString().length, 0);
            if (n) {
                if (new Set([n, a]).size > 1) return Promise.reject()
            } else GM_setValue("art-" + o, a)
        }),
        initArtplayer: e => {
            const o = window.Artplayer || unsafeWindow.Artplayer,
                { isMobile: n } = o.utils;
            return Object.assign(o, {
                ASPECT_RATIO: ["default", "自动", "4:3", "16:9"],
                AUTO_PLAYBACK_TIMEOUT: 1e4,
                NOTICE_TIME: 5e3
            }), new o(e = Object.assign({
                container: "#artplayer",
                url: "",
                quality: [],
                type: "hls",
                autoplay: !0,
                autoPlayback: !0,
                aspectRatio: !0,
                contextmenu: [],
                customType: {
                    hls: (t, e, o) => {
                        const n = window.Hls || unsafeWindow.Hls;
                        if (n.isSupported()) {
                            o.hls && o.hls.destroy();
                            const a = new n({
                                maxBufferLength: 10 * n.DefaultConfig.maxBufferLength,
                                xhrSetup: (t, e) => {
                                    const n = (e.match(/^http(?:s)?:\/\/(.*?)\//) || [])[1];
                                    if (n !== location.host) {
                                        if (/backhost=/.test(e)) {
                                            var a, s = (decodeURIComponent(e || "").match(/backhost=(\[.*?\])/) || [])[1];
                                            if (s) {
                                                try {
                                                    a = JSON.parse(s)
                                                } catch (t) {}
                                                if (a && a.length) {
                                                    const t = (a = [].concat(a, [n])).findIndex(t => t === o.realHost);
                                                    o.realHost = a[t + 1 >= a.length ? 0 : t + 1]
                                                }
                                            }
                                            o.realHost && (e = e.replace(n, o.realHost), t.open("GET", e, !0))
                                        }
                                    }
                                }
                            });
                            a.loadSource(e), a.attachMedia(t), a.on(n.Events.ERROR, (t, e) => {
                                if (e.fatal) switch (e.type) {
                                    case n.ErrorTypes.NETWORK_ERROR:
                                        e.details === n.ErrorDetails.MANIFEST_LOAD_ERROR ? setTimeout(() => a.loadSource(a.url), 1e3) : e.details === n.ErrorDetails.MANIFEST_LOAD_TIMEOUT || e.details === n.ErrorDetails.MANIFEST_PARSING_ERROR ? a.loadSource(a.url) : e.details === n.ErrorDetails.FRAG_LOAD_ERROR ? (a.fragLoadError = (a.fragLoadError || 0) + 1) < 5 ? (a.loadSource(a.url), a.media.currentTime = o.currentTime, a.media.play()) : (a.destroy(), o.notice.show = "视频播放错误次数过多，请刷新重试") : setTimeout(() => a.startLoad(), 1e3);
                                        break;
                                    case n.ErrorTypes.MEDIA_ERROR:
                                        a.recoverMediaError();
                                        break;
                                    default:
                                        a.destroy(), o.notice.show = "视频播放异常，请刷新重试"
                                }
                            }), o.hls = a, o.on("destroy", () => a.destroy())
                        } else t.canPlayType("application/vnd.apple.mpegurl") ? t.src = e : (alert("不支持的播放格式：m3u8"), o.notice.show = "Unsupported playback format: m3u8")
                    }
                },
                flip: !1,
                icons: {
                    loading: '<img src="https://artplayer.org/assets/img/ploading.gif">',
                    state: '<img width="150" heigth="150" src="https://artplayer.org/assets/img/state.svg">',
                    indicator: '<img width="16" heigth="16" src="https://artplayer.org/assets/img/indicator.svg">'
                },
                id: "",
                pip: !n,
                poster: "",
                playbackRate: !1,
                screenshot: !0,
                setting: !0,
                subtitle: {
                    url: "",
                    type: "auto",
                    style: {
                        color: "#fe9200",
                        bottom: "5%",
                        fontSize: "25px",
                        fontWeight: 400,
                        fontFamily: "",
                        textShadow: ""
                    },
                    encoding: "utf-8",
                    escape: !1
                },
                subtitleOffset: !1,
                hotkey: !0,
                fullscreen: !0,
                fullscreenWeb: !n
            }, e), e => {
                t.forEach(t => {
                    e.plugins.add(t())
                })
            })
        },
        loadJs: t => (window.instances || (window.instances = {}), window.instances[t] || (window.instances[t] = new Promise((e, o) => {
            const n = document.createElement("script");
            n.src = t, n.type = "text/javascript", n.onload = e, n.onerror = o, Node.prototype.appendChild.call(document.head, n)
        }), window.instances[t])
    };
    console.info(`%c artPlugins %c ${e.version} %c https://scriptcat.org/zh-CN/users/13895`, "color: #fff; background: #5f5f5f", "color: #fff; background: #4bc729", "");
    return e
}([
    () => t => {
        // 移除用户验证和赞助弹窗
        return {
            name: "user",
            userJSON: function() {
                return Promise.resolve({}); // 返回空对象，避免后续检查
            },
            show: function() {
                // 空函数，不再显示赞助弹窗
            }
        };
    },
    () => t => {
        // 清晰度插件 - 保留但移除用户验证
        const { i18n: e, option: o, notice: n, storage: a, controls: s, constructor: { utils: { isMobile: r, setStyle: i } } } = t;

        function l(t) {
            return r ? t.split(/\s/).shift() : t
        }

        function c() {
            const { file: r, quality: i, getUrl: c, adToken: u } = o,
                [, p, d] = ((r || {}).resolution || "").match(/width:(\d+),height:(\d+)/),
                h = +p * +d;
            h > 2073600 && i.unshift({ html: "2K 1440P", url: c("M3U8_AUTO_2K") + "&adToken=" + encodeURIComponent(u), default: !1, type: "hls" }), h > 3686400 && i.unshift({ html: "4K 2160P", url: c("M3U8_AUTO_4K") + "&adToken=" + encodeURIComponent(u), default: !1, type: "hls" });
            const m = i.find(t => t.default) || i[0];
            s.update({
                name: "quality",
                html: m ? l(m.html) : "",
                selector: i.map((t, e) => ({ ...t })),
                onSelect: o => (t.switchQuality(o.url), n.show = `${e.get("Switch Video")}: ${o.html}`, a.set("quality", l(o.html)), l(o.html)),
                mounted: () => {
                    const e = a.get("quality");
                    if (e) {
                        const o = s.cache.get("quality").option.selector.find(t => l(t.html) === e);
                        o && !o.default && (t.switchQuality(o.url), s.check(o))
                    }
                }
            })
        }

        function u() {
            // 不再检查用户状态，直接添加清晰度控制
            c();
            let e = o.id;
            t.on("restart", () => {
                if (e === o.id) {
                    const e = t.layers.cache.get("auto-playback");
                    if (e) {
                        const { $ref: t } = e;
                        i(t, "display", "none")
                    }
                } else e = o.id, c()
            })
        }
        return t.isReady ? u() : t.once("ready", u), { name: "quality" }
    },
    () => t => {
        // 播放列表插件 - 保留
        const { i18n: e, proxy: o, option: n, controls: a, constructor: { utils: { isMobile: s } } } = t,
            r = { showtext: !s, icon: '<i class="art-icon art-icon-playlist"></i>' };
        
        function i() {
            // 不再检查用户状态，直接添加播放列表
            if (n.filelist && n.filelist.length > 1) {
                a.update({
                    html: r.showtext ? e.get("PlayList") : r.icon,
                    name: "playlist",
                    position: "right",
                    style: { paddingLeft: "10px", paddingRight: "10px" },
                    selector: n.filelist.map((t, e) => ({ ...t, html: t.name, style: { textAlign: "left" } })),
                    onSelect: t => (n.file = t, "function" == typeof t.open && t.open(), r.showtext ? e.get("PlayList") : r.icon),
                    mounted: () => {
                        const t = a.cache.get("playlist"),
                            { $ref: e, option: { selector: n } } = t,
                            r = o(".art-selector-list", e),
                            i = o(".art-selector-value", e),
                            l = r.offsetHeight,
                            c = r.firstElementChild.offsetHeight;
                        a.proxy(i, "click", t => {
                            const e = n.findIndex(t => t.default);
                            r.scrollTop = (e + 1) * c - l / 2
                        })
                    }
                })
            } else {
                a.cache.get("PlayList") && a.remove("playlist")
            }
        }
        return e.update({ "zh-cn": { PlayList: "播放列表" } }), t.isReady ? i() : t.once("ready", i), { name: "playlist" }
    },
    () => t => {
        // 播放速度插件 - 保留但移除赞助检查
        const { i18n: e, icons: o, option: n, layers: a, storage: s, plugins: r, setting: i, contextmenu: l, constructor: { PLAYBACK_RATE: c, SETTING_ITEM_WIDTH: u, utils: { query: p, append: d, setStyle: h, inverseClass: m } } } = t;
        
        function g() {
            return a["auto-playbackrate"] || a.update({
                name: "auto-playbackrate",
                html: `<div>播放速度</div><input type="number" value="${t.playbackRate}" style="min-height: 20px;border: none; border-radius: 3px;text-align: center;" step=".01" max="16" min=".1"><div class="art-auto-playback-close"><i class="art-icon art-icon-close"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="22" height="22" style="fill: var(--art-theme);width: 15px;height: 15px;"><path d="m571.733 512 268.8-268.8c17.067-17.067 17.067-42.667 0-59.733-17.066-17.067-42.666-17.067-59.733 0L512 452.267l-268.8-268.8c-17.067-17.067-42.667-17.067-59.733 0-17.067 17.066-17.067 42.666 0 59.733l268.8 268.8-268.8 268.8c-17.067 17.067-17.067 42.667 0 59.733 8.533 8.534 19.2 12.8 29.866 12.8s21.334-4.266 29.867-12.8l268.8-268.8 268.8 268.8c8.533 8.534 19.2 12.8 29.867 12.8s21.333-4.266 29.866-12.8c17.067-17.066 17.067-42.666 0-59.733L571.733 512z"></path></svg></i></div>`,
                tooltip: "",
                style: { "border-radius": "var(--art-border-radius)", left: "var(--art-padding)", bottom: "calc(var(--art-control-height) + var(--art-bottom-gap) + 10px)", "background-color": "var(--art-widget-background)", "align-items": "center", gap: "10px", padding: "10px", "line-height": 1, display: "none", position: "absolute" },
                mounted: e => {
                    const o = p("input", e),
                        n = p(".art-auto-playback-close", e);
                    t.proxy(o, "change", () => {
                        const e = o.value;
                        t.playbackRate = e
                    }), t.proxy(n, "click", () => {
                        h(e, "display", "none")
                    })
                }
            })
        }
        
        function f(t) {
            return 1 === t ? e.get("Normal") : t ? t.toFixed(2) : e.get("Custom")
        }
        
        function b() {
            return c.includes(t.playbackRate) ? t.playbackRate : 0
        }
        
        function x() {
            const t = i.find(`playback-rate-${b()}`);
            t && i.check(t)
        }
        
        function y() {
            // 不再检查用户状态，直接应用播放速度
            t.on("video:ratechange", () => s.set("playbackRate", t.playbackRate));
            const e = s.get("playbackRate");
            e && (t.playbackRate = Number(e))
        }
        
        return e.update({ "zh-cn": { Custom: "自定义" } }), c.unshift(0), i.update({
            width: u,
            name: "playback-rate",
            html: e.get("Play Speed"),
            tooltip: f(t.playbackRate),
            icon: o.playbackRate,
            selector: c.map(t => ({
                value: t,
                name: `playback-rate-${t}`,
                default: t === b(),
                html: f(t)
            })),
            onSelect(e) {
                if (e.value) t.playbackRate = e.value, h(g(), "display", "none");
                else {
                    p("input", g()).value = t.playbackRate, h(g(), "display", "flex")
                }
                return e.html
            },
            mounted: () => {
                x(), t.on("video:ratechange", () => x())
            }
        }), l.update({
            index: 10,
            name: "playbackRate",
            html: `${e.get("Play Speed")}: ${c.map(t => `<span data-value="${t}">${f(t)}</span>`).join("")}`,
            click: (e, o) => {
                e.show = !1;
                const { value: n } = o.target.dataset;
                if (Number(n)) t.playbackRate = Number(n), h(g(), "display", "none");
                else {
                    p("input", g()).value = t.playbackRate, h(g(), "display", "flex")
                }
            },
            mounted: e => {
                const o = p(`[data-value='${b()}']`, e);
                o && m(o, "art-current"), t.on("video:ratechange", () => {
                    const t = p(`[data-value='${b()}']`, e);
                    t && m(t, "art-current")
                })
            }
        }), t.isReady ? y() : t.once("ready", y), { name: "playbackRate" }
    },
    // 其他插件保持不变，但移除所有与用户验证相关的逻辑
    // ... 这里只保留核心插件作为示例
]);
