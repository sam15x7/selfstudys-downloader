// ==UserScript==
// @name         SelfStudys PDF Downloader
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Bypasses PDF restrictions, auto-names files perfectly, and includes a custom social dock.
// @author       Samihan (github.com/sam15x7)
// @match        *://*.selfstudys.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function injectStyles() {
        if (document.getElementById('selfstudys-mod-styles')) return;

        const style = document.createElement('style');
        style.id = 'selfstudys-mod-styles';
        style.innerHTML = `
            /* --- WIDGET CONTAINER --- */
            #ss-widget-container {
              position: fixed;
              bottom: 30px;
              right: 30px;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 15px;
              z-index: 999999;
              font-family: "Galano Grotesque", Poppins, Montserrat, sans-serif;
            }

            /* --- FROSTED SOCIAL DOCK --- */
            .social-dock {
              position: relative;
              background: rgba(0, 0, 0, 0.2);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border-radius: 1rem;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              padding: 8px;
              display: flex;
              align-items: flex-end;
              gap: 8px;
            }

            .social-icon {
              width: 56px;
              height: 56px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              clip-path: url(#squircleClip);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .social-icon:hover {
              transform: scale(1.1) translateY(-8px);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .social-icon svg {
              width: 32px;
              height: 32px;
              color: white;
            }

            /* Specific Icon Gradients */
            .icon-github { background: linear-gradient(to bottom right, #374151, #111827); border-color: rgba(75,85,99,0.5); }
            .icon-linkedin { background: linear-gradient(to bottom right, #2563eb, #1e40af); border-color: rgba(59,130,246,0.5); }
            .icon-youtube { background: linear-gradient(to bottom right, #dc2626, #991b1b); border-color: rgba(239,68,68,0.5); }

            /* --- AIRPLANE DOWNLOAD BUTTON --- */
            .mod-button {
              --primary: #ff5569;
              --neutral-1: #f7f8f7;
              --neutral-2: #e7e7e7;
              --radius: 14px;
              cursor: pointer;
              border-radius: var(--radius);
              text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
              border: none;
              box-shadow: 0 0.5px 0.5px 1px rgba(255, 255, 255, 0.2), 0 10px 20px rgba(0, 0, 0, 0.2), 0 4px 5px 0px rgba(0, 0, 0, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              transition: all 0.3s ease;
              min-width: 200px;
              padding: 20px;
              height: 68px;
              font-family: inherit;
              font-size: 18px;
              font-weight: 600;
              color: #333;
              outline: none;
            }
            .mod-button:hover {
              transform: scale(1.02);
              box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 15px 30px rgba(0, 0, 0, 0.3), 0 10px 3px -3px rgba(0, 0, 0, 0.04);
            }
            .mod-button:active { transform: scale(1); box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 10px 3px -3px rgba(0, 0, 0, 0.2); }
            .mod-button:after {
              content: ""; position: absolute; inset: 0; border-radius: var(--radius); border: 2.5px solid transparent;
              background: linear-gradient(var(--neutral-1), var(--neutral-2)) padding-box, linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.45)) border-box;
              z-index: 0; transition: all 0.4s ease;
            }
            .mod-button:hover::after { transform: scale(1.05, 1.1); box-shadow: inset 0 -1px 3px 0 rgba(255, 255, 255, 1); }
            .mod-button::before {
              content: ""; inset: 7px 6px 6px 6px; position: absolute; background: linear-gradient(to top, var(--neutral-1), var(--neutral-2));
              border-radius: 30px; filter: blur(0.5px); z-index: 2;
            }
            .state { padding-left: 29px; z-index: 2; display: flex; position: relative; }
            .state p { display: flex; align-items: center; justify-content: center; margin: 0; }
            .state .icon {
              position: absolute; left: 0; top: 0; bottom: 0; margin: auto; transform: scale(1.25); transition: all 0.3s ease;
              display: flex; align-items: center; justify-content: center;
            }
            .state .icon svg { overflow: visible; stroke: #333; }

            .outline {
              position: absolute; border-radius: inherit; overflow: hidden; z-index: 1; opacity: 0; transition: opacity 0.4s ease; inset: -2px -3.5px;
            }
            .outline::before {
              content: ""; position: absolute; inset: -100%; background: conic-gradient(from 180deg, transparent 60%, white 80%, transparent 100%);
              animation: spin 2s linear infinite; animation-play-state: paused;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .mod-button:hover .outline { opacity: 1; }
            .mod-button:hover .outline::before { animation-play-state: running; }

            .state p span { display: block; opacity: 0; animation: slideDown 0.8s ease forwards calc(var(--i) * 0.03s); }
            .mod-button:hover p span { opacity: 1; animation: wave 0.5s ease forwards calc(var(--i) * 0.02s); }
            .mod-button:focus p span { opacity: 1; animation: disapear 0.6s ease forwards calc(var(--i) * 0.03s); }

            @keyframes wave {
              30% { opacity: 1; transform: translateY(4px) translateX(0) rotate(0); }
              50% { opacity: 1; transform: translateY(-3px) translateX(0) rotate(0); color: var(--primary); }
              100% { opacity: 1; transform: translateY(0) translateX(0) rotate(0); }
            }
            @keyframes slideDown {
              0% { opacity: 0; transform: translateY(-20px) translateX(5px) rotate(-90deg); color: var(--primary); filter: blur(5px); }
              30% { opacity: 1; transform: translateY(4px) translateX(0) rotate(0); filter: blur(0); }
              50% { opacity: 1; transform: translateY(-3px) translateX(0) rotate(0); }
              100% { opacity: 1; transform: translateY(0) translateX(0) rotate(0); }
            }
            @keyframes disapear { from { opacity: 1; } to { opacity: 0; transform: translateX(5px) translateY(20px); color: var(--primary); filter: blur(5px); } }

            .state--default .icon svg { animation: land 0.6s ease forwards; }
            .mod-button:hover .state--default .icon { transform: rotate(45deg) scale(1.25); }
            .mod-button:focus .state--default svg { animation: takeOff 0.8s linear forwards; }
            .mod-button:focus .state--default .icon { transform: rotate(0) scale(1.25); }

            @keyframes takeOff {
              0% { opacity: 1; }
              60% { opacity: 1; transform: translateX(70px) rotate(45deg) scale(2); }
              100% { opacity: 0; transform: translateX(160px) rotate(45deg) scale(0); }
            }
            @keyframes land {
              0% { transform: translateX(-60px) translateY(30px) rotate(-50deg) scale(2); opacity: 0; filter: blur(3px); }
              100% { transform: translateX(0) translateY(0) rotate(0); opacity: 1; filter: blur(0); }
            }

            .state--default .icon:before {
              content: ""; position: absolute; top: 50%; height: 2px; width: 0; left: -5px; background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.5));
            }
            .mod-button:focus .state--default .icon:before { animation: contrail 0.8s linear forwards; }
            @keyframes contrail { 0% { width: 0; opacity: 1; } 8% { width: 15px; } 60% { opacity: 0.7; width: 80px; } 100% { opacity: 0; width: 160px; } }

            .state--default span:nth-child(4) { margin-right: 5px; }
            .state--sent { display: none; }
            .state--sent svg { transform: scale(1.25); margin-right: 8px; stroke: var(--primary); }

            .mod-button:focus .state--default { position: absolute; }
            .mod-button:focus .state--sent { display: flex; }
            .mod-button:focus .state--sent span { opacity: 0; animation: slideDown 0.8s ease forwards calc(var(--i) * 0.2s); }
            .mod-button:focus .state--sent .icon svg { opacity: 0; animation: appear 1.2s ease forwards 0.8s; }
            @keyframes appear {
              0% { opacity: 0; transform: scale(4) rotate(-40deg); color: var(--primary); filter: blur(4px); }
              30% { opacity: 1; transform: scale(0.6); filter: blur(1px); }
              50% { opacity: 1; transform: scale(1.2); filter: blur(0); }
              100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    function injectUI() {
        if (document.getElementById('ss-widget-container')) return;

        // Container
        const container = document.createElement('div');
        container.id = 'ss-widget-container';

        // Hidden SVG for the Apple-style Squircle shape
        const squircleSvg = document.createElement('div');
        squircleSvg.innerHTML = `
            <svg width="0" height="0" style="position: absolute;">
              <defs>
                <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
                  <path d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5"></path>
                </clipPath>
              </defs>
            </svg>
        `;
        document.body.appendChild(squircleSvg);

        // 1. Social Dock
        const dock = document.createElement('div');
        dock.className = 'social-dock';
        dock.innerHTML = `
            <a href="https://github.com/sam15x7" target="_blank" class="social-icon icon-github">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
            </a>
            <a href="https://www.linkedin.com/in/samihanchatterjee/" target="_blank" class="social-icon icon-linkedin">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
            </a>
            <a href="https://youtube.com/samihanchatterjee" target="_blank" class="social-icon icon-youtube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
            </a>
        `;

        // 2. The Custom Airplane Download Button
        const dlBtn = document.createElement('button');
        dlBtn.className = 'mod-button';
        dlBtn.innerHTML = `
            <div class="outline"></div>
            <div class="state state--default">
                <div class="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2z"></path></svg>
                </div>
                <p>
                    <span style="--i:0">D</span><span style="--i:1">o</span><span style="--i:2">w</span><span style="--i:3">n</span><span style="--i:4">l</span><span style="--i:5">o</span><span style="--i:6">a</span><span style="--i:7">d</span>
                </p>
            </div>
            <div class="state state--sent">
                <div class="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p>
                    <span style="--i:0">D</span><span style="--i:1">o</span><span style="--i:2">n</span><span style="--i:3">e</span><span style="--i:4">!</span>
                </p>
            </div>
        `;

        // The download logic with bulletproof regex
        dlBtn.addEventListener('mousedown', function() {
            setTimeout(() => {
                let pdfUrl = '';
                let pdfName = 'SelfStudys_Document';

                const scripts = document.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const scriptContent = scripts[i].innerHTML;

                    // 1. Get the URL
                    if (!pdfUrl) {
                        const match = scriptContent.match(/var\s+pdfPath\s*=\s*["']([^"']+)["']/i);
                        if (match && match[1]) {
                            pdfUrl = match[1];
                        } else {
                            const fallbackMatch = scriptContent.match(/(https?:\/\/[^\s"']+sitepdfs\/[a-zA-Z0-9]+)/i);
                            if (fallbackMatch && fallbackMatch[1]) {
                                pdfUrl = fallbackMatch[1];
                            }
                        }
                    }

                    // 2. Safely get the Name (Avoiding jqXHR AJAX errors)
                    if (pdfName === 'SelfStudys_Document') {
                        // Check Adobe First
                        const adobeNameMatch = scriptContent.match(/fileName:\s*["']([^"']+)["']/i);
                        if (adobeNameMatch && adobeNameMatch[1]) {
                            pdfName = adobeNameMatch[1];
                        }
                        // If not Adobe, safely check for Normal Embed ONLY inside the apiData object
                        else {
                            const apiDataMatch = scriptContent.match(/apiData\s*=\s*\{[\s\S]*?title\s*:\s*["']([^"']+)["']/i);
                            if (apiDataMatch && apiDataMatch[1]) {
                                pdfName = apiDataMatch[1];
                            }
                        }
                    }
                }

                // Ultimate fallback to browser tab title
                if (pdfName === 'SelfStudys_Document' && document.title) {
                    pdfName = document.title.split('|')[0].trim();
                }

                // Clean and trigger download
                if (pdfUrl) {
                    pdfName = pdfName.replace(/[\/\\?%*:|"<>]/g, '-');
                    if (!pdfName.toLowerCase().endsWith('.pdf')) {
                        pdfName += '.pdf';
                    }

                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = pdfName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert('Could not find the hidden PDF link on this specific page.');
                }
            }, 800);
        });

        // Append to container, then container to body
        container.appendChild(dock);
        container.appendChild(dlBtn);
        document.body.appendChild(container);
    }

    injectStyles();
    injectUI();
    setInterval(injectUI, 1000);

})();
