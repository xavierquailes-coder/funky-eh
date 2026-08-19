<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>RIW Chat</title>
        <link rel="icon" href="favicon.png">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js"></script>
        <style>
            :root {
                --bg: #050505;
                --panel: #0a0a0a;
                --panel2: #101010;
                --line: #242424;
                --muted: #858585;
                --text: #f5f5f5;
                --pink: #ff39a5;
                --green: #16e76d
            }

            * {
                box-sizing: border-box
            }

            html,body {
                margin: 0;
                height: 100%;
                background: #000;
                color: var(--text);
                font-family: Inter,system-ui,sans-serif;
                overflow: hidden
            }

            button,input,textarea {
                font: inherit
            }

            .app {
                height: 100vh;
                display: grid;
                grid-template-columns: 230px minmax(0,1fr) 265px;
                background: #000
            }

            .sidebar {
                border-right: 1px solid var(--line);
                padding: 12px 10px;
                background: #080808;
                overflow: auto
            }

            .search {
                position: relative
            }

            .search i {
                position: absolute;
                left: 11px;
                top: 11px;
                color: #777
            }

            .search input {
                width: 100%;
                height: 38px;
                padding: 0 12px 0 34px;
                border: 1px solid #292929;
                border-radius: 9px;
                background: #121212;
                color: #eee;
                outline: none
            }

            .section-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: #777;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: .08em;
                margin: 22px 4px 8px;
                text-transform: uppercase
            }

            .section-title button {
                border: 0;
                background: none;
                color: #777;
                font-size: 17px;
                cursor: pointer
            }

            .nav-item {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 10px;
                border: 0;
                background: transparent;
                color: #b7b7b7;
                padding: 9px;
                border-radius: 8px;
                cursor: pointer;
                text-align: left
            }

            .nav-item:hover,.nav-item.active {
                background: #1a1a1a;
                color: #fff
            }

            .nav-item .avatar {
                width: 31px;
                height: 31px
            }

            .channels .nav-item {
                padding: 8px 9px;
                font-family: 'Lexend',Inter,system-ui,sans-serif;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: -.01em;
                line-height: 1.35
            }

            .channels .nav-item>span:first-child {
                font-family: 'Lexend',Inter,sans-serif;
                font-weight: 600;
                color: #8f96a3;
                flex: 0 0 auto
            }

            .channels .nav-item.active>span:first-child {
                color: #fff
            }

            .main {
                min-width: 0;
                display: flex;
                flex-direction: column
            }

            .topbar {
                height: 58px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid var(--line);
                padding: 0 18px;
                background: #070707
            }

            .topbar h2 {
                font-size: 16px;
                margin: 0
            }

            .top-actions {
                display: flex;
                gap: 8px
            }

            .icon-btn {
                width: 36px;
                height: 36px;
                border-radius: 9px;
                border: 1px solid #292929;
                background: #101010;
                color: #aaa;
                cursor: pointer
            }

            .icon-btn:hover {
                color: #fff;
                border-color: #555
            }

            .messages {
                flex: 1;
                overflow: auto;
                padding: 18px 20px 10px
            }

            .empty {
                height: 100%;
                display: grid;
                place-items: center;
                color: #555;
                text-align: center
            }

            .message {
                display: grid;
                grid-template-columns: 42px minmax(0,1fr);
                gap: 11px;
                padding: 8px 6px;
                border-radius: 8px
            }

            .message:hover {
                background: #090909
            }

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
                background: #c9c9cb
            }

            .message-head {
                display: flex;
                align-items: baseline;
                gap: 7px
            }

            .display {
                font-weight: 800;
                font-size: 14px;
                cursor: pointer
            }

            .username,.ago {
                font-size: 11px;
                color: #696969
            }

            .body {
                font-size: 14px;
                line-height: 1.48;
                margin-top: 3px;
                word-break: break-word
            }

            .mention {
                color: #8ea7ff;
                background: #10182e;
                border-radius: 4px;
                padding: 1px 3px
            }

            .everyone-mention {
                color: #ffcf55;
                background: #2b2208
            }

            .composer textarea:disabled {
                cursor: not-allowed
            }

            .tools button:disabled {
                cursor: not-allowed;
                opacity: .35
            }

            .gif {
                max-width: min(430px,100%);
                max-height: 330px;
                border-radius: 11px;
                margin-top: 8px;
                display: block
            }

            .composer-wrap {
                padding: 8px 18px 16px
            }

            .composer {
                border: 1px solid #272727;
                background: #0b0b0b;
                border-radius: 16px;
                overflow: hidden
            }

            .composer textarea {
                width: 100%;
                min-height: 54px;
                max-height: 150px;
                resize: none;
                background: transparent;
                border: 0;
                color: #eee;
                padding: 14px;
                outline: none
            }

            .composer textarea:disabled {
                color: #555
            }

            .tools {
                height: 38px;
                border-top: 1px solid #191919;
                display: flex;
                align-items: center;
                gap: 2px;
                padding: 0 10px
            }

            .tools button {
                border: 0;
                background: none;
                color: #777;
                width: 29px;
                height: 28px;
                cursor: pointer;
                border-radius: 6px;
                font-weight: 800
            }

            .tools button:hover {
                background: #171717;
                color: white
            }

            .send {
                margin-left: auto!important;
                color: var(--pink)!important
            }

            .rightbar {
                border-left: 1px solid var(--line);
                background: #070707;
                padding: 15px 14px;
                overflow: auto
            }

            .rightbar h3 {
                font-size: 12px;
                color: #737373;
                text-transform: uppercase;
                letter-spacing: .07em
            }

            .member {
                display: flex;
                align-items: center;
                gap: 9px;
                padding: 8px 2px
            }

            .member .avatar {
                width: 32px;
                height: 32px
            }

            .status-dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                margin-left: auto;
                flex: 0 0 9px
            }

            .status-dot.online {
                background: var(--green);
                box-shadow: 0 0 7px rgba(67,207,124,.45)
            }

            .status-dot.offline {
                background: #555
            }

            .member.offline {
                opacity: .62
            }

            .member-section-label {
                margin: 14px 2px 6px;
                color: #777;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase
            }

            .banned-label {
                display: inline-flex;
                align-items: center;
                border: 1px solid #6b2632;
                color: #ff8094;
                background: #1b0d10;
                border-radius: 999px;
                padding: 1px 6px;
                font-size: 9px;
                font-weight: 800;
                margin-left: 5px
            }

            .auth-callout {
                padding: 13px;
                border: 1px solid #292929;
                background: #0f0f0f;
                border-radius: 12px;
                color: #888;
                font-size: 12px;
                line-height: 1.5
            }

            .pink-btn {
                border: 0;
                background: var(--pink);
                color: white;
                border-radius: 10px;
                padding: 10px 15px;
                font-weight: 800;
                cursor: pointer
            }

            .ghost-btn {
                border: 1px solid #292929;
                background: #101010;
                color: #aaa;
                border-radius: 10px;
                padding: 10px 15px;
                font-weight: 700;
                cursor: pointer
            }

            .modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,.78);
                backdrop-filter: blur(6px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 99;
                padding: 20px
            }

            .modal-backdrop.show {
                display: flex
            }

            .modal {
                width: min(460px,100%);
                max-height: 90vh;
                overflow: auto;
                background: #0b0b0b;
                border: 1px solid #252525;
                border-radius: 18px;
                padding: 22px;
                box-shadow: 0 25px 80px #000
            }

            .modal h2 {
                font-size: 18px;
                margin: 0 0 20px
            }

            .field {
                margin: 13px 0
            }

            .field label {
                display: block;
                color: #777;
                font-size: 11px;
                margin-bottom: 7px
            }

            .field input,.field textarea {
                width: 100%;
                border: 1px solid #383838;
                background: #121212;
                color: #eee;
                border-radius: 9px;
                padding: 11px;
                outline: none
            }

            .field textarea {
                min-height: 85px;
                resize: vertical
            }

            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 22px
            }

            .profile-card {
                width: min(420px,100%);
                background: #0b0b0b;
                border: 1px solid #272727;
                border-radius: 20px;
                overflow: hidden;
                position: relative
            }

            .banner {
                height: 130px;
                background: #111 center/cover no-repeat
            }

            .profile-main {
                padding: 0 16px 18px
            }

            .profile-avatar {
                width: 82px;
                height: 82px;
                border-radius: 50%;
                object-fit: cover;
                background: #c9c9cb;
                border: 6px solid #0b0b0b;
                margin-top: -41px
            }

            .close-x {
                position: absolute;
                right: 12px;
                top: 112px;
                width: 31px;
                height: 31px;
                border: 0;
                border-radius: 50%;
                background: #222;
                color: #aaa;
                cursor: pointer
            }

            .profile-name {
                font-size: 20px;
                font-weight: 800;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 5px;
                line-height: 1.2;
                min-height: 24px
            }

            .profile-user {
                color: #888;
                font-size: 12px
            }

            .profile-bio {
                font-size: 13px;
                line-height: 1.5;
                margin: 16px 0
            }

            .profile-meta {
                border-top: 1px solid #222;
                padding-top: 12px;
                color: #aaa;
                font-size: 12px;
                display: flex;
                gap: 16px
            }

            .profile-actions {
                display: flex;
                gap: 8px;
                margin-top: 14px
            }

            .default-avatar {
                background: #c7c8cb
            }

            .toast {
                position: fixed;
                right: 20px;
                bottom: 20px;
                background: #161616;
                border: 1px solid #333;
                padding: 11px 15px;
                border-radius: 10px;
                z-index: 200;
                opacity: 0;
                transform: translateY(8px);
                transition: .2s
            }

            .toast.show {
                opacity: 1;
                transform: none
            }

            .owner-panel {
                display: none;
                margin-top: 18px;
                padding-top: 16px;
                border-top: 1px solid #292929
            }

            .owner-panel.show {
                display: block
            }

            .owner-title {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #ffcf55;
                font-weight: 800;
                margin-bottom: 12px
            }

            .owner-grid {
                display: grid;
                grid-template-columns: minmax(0,1fr) 110px;
                gap: 8px
            }

            .owner-list {
                display: grid;
                gap: 10px;
                margin-top: 12px
            }

            .owner-user-row {
                display: grid;
                grid-template-columns: minmax(170px,1fr) minmax(150px,190px) max-content max-content;
                gap: 10px;
                align-items: center;
                padding: 10px;
                border: 1px solid #242424;
                border-radius: 10px;
                background: #0c0c0c
            }

            .owner-user-row>div:first-child {
                min-width: 0
            }

            .owner-user-row>div:first-child b,.owner-user-row>div:first-child div {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap
            }

            .owner-user-row select {
                width: 100%;
                min-width: 0;
                background: #111;
                color: #eee;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 9px
            }

            .verify-btn,.remove-role-btn,.power-btn,.ban-btn {
                white-space: nowrap;
                border: 1px solid #333;
                background: #111;
                color: #aaa;
                border-radius: 8px;
                padding: 9px 12px;
                cursor: pointer
            }

            .remove-role-btn {
                color: #ff7b8f;
                border-color: #5a2931
            }

            .remove-role-btn:disabled {
                opacity: .4;
                cursor: not-allowed
            }

            .verify-btn.on {
                color: #6bb6ff;
                border-color: #397ccc
            }

            .power-btn {
                border: 1px solid #5a4320;
                background: #19150d;
                color: #ffd36b;
                border-radius: 8px;
                padding: 9px 12px;
                cursor: pointer
            }

            .power-btn.coowner {
                color: #cba7ff;
                border-color: #553c73
            }

            .power-btn.remove {
                color: #ff8798;
                border-color: #60303a
            }

            .ban-btn {
                white-space: nowrap;
                border: 1px solid #6b2632;
                background: #1b0d10;
                color: #ff8094;
                border-radius: 8px;
                padding: 9px 12px;
                cursor: pointer
            }

            .ban-btn.unban {
                border-color: #285a3a;
                background: #101a13;
                color: #68df8d
            }

            .ban-btn:disabled {
                opacity: .4;
                cursor: not-allowed
            }

            .verified-check {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 16px;
                width: 16px;
                height: 16px;
                margin-left: 2px;
                border-radius: 50%;
                background: #4f9cff;
                color: #fff;
                font-size: 10px;
                line-height: 1;
                vertical-align: middle;
                position: relative;
                top: 0;
                box-shadow: 0 0 8px rgba(79,156,255,.35)
            }

            .profile-name .verified-check {
                margin-left: 0;
                align-self: center;
                transform: none
            }

            .role-badge {
                display: inline-flex;
                align-items: center;
                border-radius: 999px;
                padding: 2px 7px;
                font-size: 10px;
                font-weight: 800;
                margin-left: 5px;
                border: 1px solid currentColor
            }

            .profile-role-row {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 9px
            }

            .owner-note {
                font-size: 11px;
                color: #777;
                line-height: 1.45;
                margin-top: 8px
            }

            @media(max-width: 980px) {
                .app {
                    grid-template-columns:205px minmax(0,1fr)
                }

                .rightbar {
                    display: none
                }
            }

            @media(max-width: 680px) {
                .app {
                    grid-template-columns:1fr
                }

                .sidebar {
                    position: fixed;
                    z-index: 20;
                    inset: 0 auto 0 0;
                    width: 260px;
                    transform: translateX(-100%);
                    transition: .2s
                }

                .sidebar.open {
                    transform: none
                }

                .topbar:before {
                    content: '☰';
                    cursor: pointer;
                    margin-right: 12px
                }

                .rightbar {
                    display: none
                }
            }

            #settingsModal .modal {
                width: min(780px,96vw)
            }

            @media(max-width: 760px) {
                #settingsModal .modal {
                    width:min(520px,96vw)
                }

                .owner-user-row {
                    grid-template-columns: minmax(0,1fr) minmax(130px,170px)
                }

                .owner-user-row .remove-role-btn,.owner-user-row .verify-btn {
                    width: 100%
                }
            }

            @media(max-width: 520px) {
                .owner-user-row {
                    grid-template-columns:1fr
                }

                .owner-user-row select,.owner-user-row button {
                    width: 100%
                }
            }

            .profile-owner-controls {
                display: none;
                margin-top: 14px;
                padding-top: 14px;
                border-top: 1px solid #252525
            }

            .profile-owner-controls.show {
                display: block
            }

            .profile-owner-title {
                color: #ffcf55;
                font-size: 12px;
                font-weight: 800;
                margin-bottom: 9px
            }

            .profile-owner-row {
                display: grid;
                grid-template-columns: minmax(0,1fr) auto;
                gap: 8px;
                margin-top: 8px
            }

            .profile-owner-row select {
                min-width: 0;
                width: 100%;
                background: #111;
                color: #eee;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 9px
            }

            .profile-owner-row button {
                white-space: nowrap
            }

            .profile-verify-row {
                align-items: center
            }

            .profile-verify-copy {
                display: flex;
                flex-direction: column;
                gap: 2px;
                color: #ddd;
                font-size: 12px
            }

            .profile-verify-copy span {
                color: #777;
                font-size: 10px
            }

            .owner-user-row {
                grid-template-columns: minmax(150px,1fr) minmax(120px,170px) max-content minmax(120px,170px) max-content max-content minmax(125px,155px) max-content max-content
            }

            .add-role-btn {
                white-space: nowrap;
                border: 1px solid #285a3a;
                background: #101a13;
                color: #68df8d;
                border-radius: 8px;
                padding: 9px 12px;
                cursor: pointer
            }

            .assigned-role-summary {
                font-size: 10px;
                color: #777;
                margin-top: 3px;
                white-space: normal!important
            }

            .profile-role-row:empty {
                display: none
            }

            @media(max-width: 900px) {
                .owner-user-row {
                    grid-template-columns:1fr 1fr
                }

                .owner-user-row>div:first-child {
                    grid-column: 1/-1
                }

                .owner-user-row .verify-btn {
                    grid-column: 1/-1
                }

                .profile-owner-row {
                    grid-template-columns: 1fr
                }
            }

            .gif-search-row {
                display: grid;
                grid-template-columns: minmax(0,1fr) auto;
                gap: 8px
            }

            .gif-search-row input {
                width: 100%;
                height: 42px;
                border: 1px solid #383838;
                background: #121212;
                color: #eee;
                border-radius: 9px;
                padding: 0 12px;
                outline: none
            }

            .gif-search-row input::placeholder {
                color: #777
            }

            .gif-search-row input:focus {
                border-color: #ff39a5;
                box-shadow: 0 0 0 2px rgba(255,57,165,.12)
            }

            .gif-results {
                display: grid;
                grid-template-columns: repeat(3,minmax(0,1fr));
                gap: 8px;
                max-height: 360px;
                overflow: auto;
                margin-top: 12px
            }

            .gif-result {
                border: 1px solid #292929;
                background: #111;
                border-radius: 10px;
                padding: 0;
                overflow: hidden;
                cursor: pointer;
                aspect-ratio: 1/1
            }

            .gif-result img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block
            }

            .gif-status {
                font-size: 12px;
                color: #777;
                margin-top: 10px
            }

            .message-menu {
                position: fixed;
                z-index: 350;
                display: none;
                min-width: 150px;
                padding: 6px;
                background: #121212;
                border: 1px solid #333;
                border-radius: 10px;
                box-shadow: 0 15px 45px #000
            }

            .message-menu.show {
                display: block
            }

            .message-menu button {
                width: 100%;
                border: 0;
                background: transparent;
                color: #ddd;
                padding: 9px 10px;
                text-align: left;
                border-radius: 7px;
                cursor: pointer
            }

            .message-menu button:hover {
                background: #222
            }

            .message-menu button.danger {
                color: #ff7b8f
            }

            .edited-label {
                font-size: 10px;
                color: #666;
                margin-left: 4px
            }

            .partner-image-logo.squiddcore-partner-logo img {
                width: 86px;
                height: 86px;
                object-fit: contain;
                border-radius: 20px
            }

            @media(max-width: 560px) {
                .gif-results {
                    grid-template-columns:repeat(2,minmax(0,1fr))
                }
            }

            /* === RIW SMOOTH MOTION PACK === */
            :root {
                --ease-out: cubic-bezier(.16,1,.3,1);
                --ease-soft: cubic-bezier(.22,1,.36,1)
            }

            html {
                scroll-behavior: smooth
            }

            body {
                animation: riwPageIn .48s var(--ease-out) both
            }

            .app {
                animation: riwAppIn .55s var(--ease-out) both
            }

            .sidebar,.rightbar,.topbar,.composer-wrap {
                will-change: transform,opacity
            }

            .sidebar {
                animation: riwSlideRight .52s var(--ease-out) both
            }

            .rightbar {
                animation: riwSlideLeft .52s .06s var(--ease-out) both
            }

            .topbar {
                animation: riwDropIn .42s .04s var(--ease-out) both
            }

            .composer-wrap {
                animation: riwRiseIn .5s .1s var(--ease-out) both
            }

            .search input,.field input,.field textarea,.composer,.icon-btn,.nav-item,.tools button,.pink-btn,.ghost-btn,.member,.owner-user-row,.verify-btn,.remove-role-btn,.power-btn,.ban-btn,.gif-result {
                transition: border-color .22s ease,background-color .22s ease,color .22s ease,box-shadow .22s ease,transform .22s var(--ease-out),opacity .22s ease
            }

            .search input:focus,.field input:focus,.field textarea:focus {
                border-color: rgba(255,57,165,.65);
                box-shadow: 0 0 0 3px rgba(255,57,165,.10),0 10px 28px rgba(0,0,0,.28);
                transform: translateY(-1px)
            }

            .composer:focus-within {
                border-color: rgba(255,57,165,.62);
                box-shadow: 0 0 0 3px rgba(255,57,165,.09),0 14px 42px rgba(0,0,0,.38);
                transform: translateY(-2px)
            }

            .composer textarea {
                transition: color .2s ease,background-color .2s ease
            }

            .icon-btn:hover,.tools button:hover,.section-title button:hover {
                transform: translateY(-2px)
            }

            .icon-btn:active,.tools button:active,.pink-btn:active,.ghost-btn:active,.nav-item:active,.verify-btn:active,.remove-role-btn:active,.power-btn:active,.ban-btn:active {
                transform: scale(.94)
            }

            .pink-btn:hover {
                box-shadow: 0 8px 24px rgba(255,57,165,.26);
                transform: translateY(-2px)
            }

            .ghost-btn:hover {
                border-color: #555;
                color: #fff;
                transform: translateY(-2px)
            }

            .send:hover {
                filter: drop-shadow(0 0 7px rgba(255,57,165,.65));
                transform: translateX(2px)
            }

            .nav-item {
                position: relative;
                overflow: hidden;
                transform-origin: left center
            }

            .nav-item::before {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg,rgba(255,57,165,.10),transparent 72%);
                opacity: 0;
                transform: translateX(-18px);
                transition: opacity .22s ease,transform .3s var(--ease-out);
                pointer-events: none
            }

            .nav-item:hover {
                transform: translateX(3px)
            }

            .nav-item:hover::before,.nav-item.active::before {
                opacity: 1;
                transform: none
            }

            .nav-item.active {
                box-shadow: inset 3px 0 0 var(--pink)
            }

            .messages {
                scroll-behavior: smooth;
                overscroll-behavior: contain
            }

            .message {
                opacity: 1;
                transform: none;
                transition: background-color .2s ease,transform .22s var(--ease-out),box-shadow .22s ease;
                transform-origin: left center
            }

            .message:hover {
                transform: translateX(3px);
                box-shadow: inset 2px 0 0 rgba(255,57,165,.32)
            }

            .message.riw-enter {
                animation: riwMessageIn .42s var(--ease-out) both
            }

            .message .avatar,.member .avatar,.profile-avatar {
                transition: transform .28s var(--ease-out),box-shadow .28s ease,filter .28s ease
            }

            .message:hover .avatar,.member:hover .avatar {
                transform: scale(1.07);
                box-shadow: 0 0 0 2px rgba(255,57,165,.20)
            }

            .display {
                transition: filter .2s ease,opacity .2s ease
            }

            .display:hover {
                filter: brightness(1.25)
            }

            .gif {
                animation: riwMediaIn .38s var(--ease-out) both;
                transition: transform .25s var(--ease-out),box-shadow .25s ease
            }

            .gif:hover {
                transform: scale(1.015);
                box-shadow: 0 12px 32px rgba(0,0,0,.42)
            }

            .mention {
                transition: background-color .2s ease,box-shadow .2s ease
            }

            .mention:hover {
                box-shadow: 0 0 0 2px rgba(142,167,255,.12)
            }

            .member {
                border-radius: 9px;
                transform-origin: left center
            }

            .member:hover {
                background: #101010;
                transform: translateX(3px)
            }

            .member.riw-enter {
                animation: riwMemberIn .38s var(--ease-out) both
            }

            .status-dot.online {
                animation: riwOnlinePulse 2.2s ease-in-out infinite
            }

            .status-dot.offline {
                transition: background-color .25s ease,opacity .25s ease
            }

            .verified-check {
                animation: riwVerifiedGlow 2.6s ease-in-out infinite
            }

            .role-badge {
                transition: transform .2s var(--ease-out),filter .2s ease
            }

            .role-badge:hover {
                transform: translateY(-1px);
                filter: brightness(1.2)
            }

            .modal-backdrop {
                display: flex!important;
                visibility: hidden;
                opacity: 0;
                pointer-events: none;
                transition: opacity .24s ease,visibility 0s linear .24s
            }

            .modal-backdrop.show {
                visibility: visible;
                opacity: 1;
                pointer-events: auto;
                transition-delay: 0s
            }

            .modal-backdrop .modal,.modal-backdrop .profile-card {
                opacity: 0;
                transform: translateY(22px) scale(.96);
                transition: opacity .3s ease,transform .38s var(--ease-out)
            }

            .modal-backdrop.show .modal,.modal-backdrop.show .profile-card {
                opacity: 1;
                transform: none
            }

            .profile-card {
                box-shadow: 0 30px 90px rgba(0,0,0,.7)
            }

            .profile-card .banner {
                background-position: center!important;
                background-size: cover!important;
                background-repeat: no-repeat!important;
                transform: none!important;
                filter: none!important;
                transition: none!important;
                will-change: auto
            }

            .profile-card:hover .banner {
                transform: none!important;
                filter: none!important
            }

            .profile-avatar:hover {
                transform: scale(1.06) rotate(-2deg);
                box-shadow: 0 0 0 3px rgba(255,57,165,.22)
            }

            .close-x:hover {
                transform: rotate(90deg) scale(1.06);
                color: #fff
            }

            .toast {
                transition: opacity .25s ease,transform .35s var(--ease-out),box-shadow .25s ease!important;
                box-shadow: 0 16px 45px rgba(0,0,0,.45)
            }

            .toast.show {
                transform: translateY(0) scale(1);
                box-shadow: 0 18px 50px rgba(0,0,0,.58),0 0 0 1px rgba(255,57,165,.12)
            }

            .empty>div {
                animation: riwFloatIn .6s var(--ease-out) both
            }

            .owner-user-row:hover {
                transform: translateY(-2px);
                border-color: #343434;
                box-shadow: 0 12px 30px rgba(0,0,0,.28)
            }

            .sidebar::-webkit-scrollbar,.rightbar::-webkit-scrollbar,.messages::-webkit-scrollbar,.modal::-webkit-scrollbar {
                width: 9px
            }

            .sidebar::-webkit-scrollbar-track,.rightbar::-webkit-scrollbar-track,.messages::-webkit-scrollbar-track,.modal::-webkit-scrollbar-track {
                background: transparent
            }

            .sidebar::-webkit-scrollbar-thumb,.rightbar::-webkit-scrollbar-thumb,.messages::-webkit-scrollbar-thumb,.modal::-webkit-scrollbar-thumb {
                background: #242424;
                border: 2px solid transparent;
                background-clip: padding-box;
                border-radius: 999px
            }

            .sidebar::-webkit-scrollbar-thumb:hover,.rightbar::-webkit-scrollbar-thumb:hover,.messages::-webkit-scrollbar-thumb:hover,.modal::-webkit-scrollbar-thumb:hover {
                background: #3a3a3a;
                border: 2px solid transparent;
                background-clip: padding-box
            }

            .riw-room-switch {
                animation: riwRoomSwitch .28s var(--ease-out) both
            }

            .riw-send-pop {
                animation: riwSendPop .34s var(--ease-out) both
            }

            @keyframes riwPageIn {
                from {
                    opacity: 0
                }

                to {
                    opacity: 1
                }
            }

            @keyframes riwAppIn {
                from {
                    opacity: 0;
                    transform: scale(.992)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwSlideRight {
                from {
                    opacity: 0;
                    transform: translateX(-20px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwSlideLeft {
                from {
                    opacity: 0;
                    transform: translateX(20px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwDropIn {
                from {
                    opacity: 0;
                    transform: translateY(-14px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwRiseIn {
                from {
                    opacity: 0;
                    transform: translateY(16px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwMessageIn {
                0% {
                    opacity: 0;
                    transform: translateY(10px) scale(.985)
                }

                100% {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwMemberIn {
                from {
                    opacity: 0;
                    transform: translateX(10px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwMediaIn {
                from {
                    opacity: 0;
                    transform: scale(.96)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwFloatIn {
                from {
                    opacity: 0;
                    transform: translateY(12px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwOnlinePulse {
                0%,100% {
                    box-shadow: 0 0 7px rgba(67,207,124,.45)
                }

                50% {
                    box-shadow: 0 0 13px rgba(67,207,124,.85)
                }
            }

            @keyframes riwVerifiedGlow {
                0%,100% {
                    box-shadow: 0 0 8px rgba(79,156,255,.35)
                }

                50% {
                    box-shadow: 0 0 13px rgba(79,156,255,.62)
                }
            }

            @keyframes riwRoomSwitch {
                from {
                    opacity: .35;
                    transform: translateY(5px)
                }

                to {
                    opacity: 1;
                    transform: none
                }
            }

            @keyframes riwSendPop {
                0% {
                    transform: scale(.82)
                }

                70% {
                    transform: scale(1.08)
                }

                100% {
                    transform: scale(1)
                }
            }

            @media(prefers-reduced-motion:reduce) {
                *,*::before,*::after {
                    animation-duration: .01ms!important;
                    animation-iteration-count: 1!important;
                    transition-duration: .01ms!important;
                    scroll-behavior: auto!important
                }
            }

            /* RIW MOBILE LAYOUT PATCH */
            .mobile-menu-btn {
                display: none
            }

            @media(max-width: 980px) {
                html,body,.app {
                    height:100%;
                    height: 100dvh
                }

                .app {
                    grid-template-columns: 205px minmax(0,1fr)
                }

                .rightbar {
                    position: fixed;
                    z-index: 80;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: min(300px,86vw);
                    display: block!important;
                    transform: translateX(105%);
                    transition: transform .28s var(--ease-out);
                    box-shadow: -18px 0 55px rgba(0,0,0,.65);
                    padding-top: 72px
                }

                .rightbar.show {
                    transform: translateX(0)
                }
            }

            @media(max-width: 680px) {
                html,body {
                    overscroll-behavior:none
                }

                .app {
                    grid-template-columns: minmax(0,1fr);
                    height: 100dvh
                }

                .main {
                    height: 100dvh;
                    min-width: 0
                }

                .mobile-menu-btn {
                    display: inline-grid;
                    place-items: center;
                    flex: 0 0 36px
                }

                .topbar:before {
                    content: none!important
                }

                .topbar {
                    height: 54px;
                    padding: 0 10px;
                    gap: 8px;
                    justify-content: flex-start;
                    position: relative;
                    z-index: 30
                }

                .topbar h2 {
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-right: auto
                }

                .top-actions {
                    gap: 5px
                }

                .icon-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px
                }

                .sidebar {
                    display: block!important;
                    position: fixed;
                    z-index: 90;
                    inset: 0 auto 0 0;
                    width: min(285px,88vw);
                    padding-top: max(14px,env(safe-area-inset-top));
                    transform: translateX(-105%);
                    transition: transform .28s var(--ease-out);
                    box-shadow: 18px 0 55px rgba(0,0,0,.7)
                }

                .sidebar.open {
                    transform: translateX(0)
                }

                .messages {
                    padding: 12px 10px 8px;
                    scroll-padding-bottom: 105px
                }

                .message {
                    grid-template-columns: 34px minmax(0,1fr);
                    gap: 8px;
                    padding: 8px 4px
                }

                .message .avatar {
                    width: 34px;
                    height: 34px
                }

                .message-head {
                    gap: 5px;
                    flex-wrap: wrap
                }

                .display {
                    font-size: 13px
                }

                .username,.ago {
                    font-size: 10px
                }

                .body {
                    font-size: 13px;
                    line-height: 1.42
                }

                .composer-wrap {
                    padding: 6px 8px calc(8px + env(safe-area-inset-bottom));
                    background: #000
                }

                .composer {
                    border-radius: 13px
                }

                .composer textarea {
                    min-height: 46px;
                    max-height: 110px;
                    padding: 11px 12px;
                    font-size: 16px
                }

                .tools {
                    height: auto;
                    min-height: 38px;
                    padding: 4px 7px;
                    gap: 1px;
                    overflow-x: auto;
                    scrollbar-width: none
                }

                .tools::-webkit-scrollbar {
                    display: none
                }

                .tools button {
                    flex: 0 0 30px;
                    width: 30px;
                    height: 30px;
                    font-size: 12px
                }

                .tools .send {
                    position: sticky;
                    right: 0;
                    background: #0b0b0b
                }

                .rightbar {
                    top: 0;
                    width: min(300px,88vw);
                    padding: 68px 14px 18px
                }

                .modal-backdrop {
                    padding: 8px;
                    align-items: flex-end
                }

                .modal,.profile-card {
                    width: 100%;
                    max-height: 92dvh;
                    border-radius: 18px 18px 0 0
                }

                .modal {
                    padding: 18px 14px calc(18px + env(safe-area-inset-bottom))
                }

                .modal-actions {
                    flex-wrap: wrap
                }

                .modal-actions button {
                    flex: 1 1 120px
                }

                .profile-card {
                    overflow: auto
                }

                .banner {
                    height: 112px;
                    flex: 0 0 112px
                }

                .profile-avatar {
                    width: 72px;
                    height: 72px;
                    margin-top: -36px
                }

                .profile-main {
                    padding: 0 14px calc(18px + env(safe-area-inset-bottom))
                }

                .profile-actions {
                    flex-wrap: wrap
                }

                .profile-actions button {
                    flex: 1 1 135px
                }

                .profile-owner-row {
                    grid-template-columns: 1fr!important
                }

                .profile-owner-row button {
                    width: 100%
                }

                .profile-meta {
                    flex-wrap: wrap;
                    gap: 8px 14px
                }

                .gif {
                    max-height: 240px
                }

                .toast {
                    left: 10px;
                    right: 10px;
                    bottom: calc(10px + env(safe-area-inset-bottom));
                    text-align: center
                }
            }

            @media(max-width: 390px) {
                .top-actions .icon-btn {
                    width:32px;
                    height: 32px
                }

                .messages {
                    padding-left: 7px;
                    padding-right: 7px
                }

                .message {
                    grid-template-columns: 30px minmax(0,1fr)
                }

                .message .avatar {
                    width: 30px;
                    height: 30px
                }
            }
        </style>
        <style id="berri-chat-theme">
            :root {
                --bg: #180914;
                --panel: #2b0d20;
                --panel2: #381129;
                --line: rgba(255,179,198,.18);
                --muted: #c78fa7;
                --text: #fff6f2;
                --pink: #e63462;
                --green: #39d98a
            }

            html,body,.app {
                background: #180914!important
            }

            .sidebar,.rightbar {
                background: #230b1b!important
            }

            .main,.topbar {
                background: #1b0916!important
            }

            .topbar {
                border-color: rgba(255,179,198,.18)!important
            }

            .nav-item:hover,.nav-item.active {
                background: rgba(230,52,98,.18)!important
            }

            .search input,.composer,.icon-btn,.ghost-btn,.modal,.profile-card {
                background: #2a0e20!important;
                border-color: rgba(255,179,198,.2)!important
            }

            .pink-btn {
                background: linear-gradient(135deg,#e63462,#ff7a9c)!important
            }

            .composer textarea {
                color: #fff6f2!important
            }

            .send {
                color: #ff7a9c!important
            }
        </style>
        <style id="berri-calling-styles">
            .call-icon-btn.hidden { display: none !important; }
            #incomingCallOverlay, #activeCallOverlay {
                position: fixed; inset: 0; z-index: 500;
                background: rgba(5,2,4,.92);
                display: none; align-items: center; justify-content: center;
                backdrop-filter: blur(6px);
            }
            #incomingCallOverlay.show, #activeCallOverlay.show { display: flex; }
            .rc-avatar {
                width: 84px; height: 84px; border-radius: 50%; object-fit: cover;
                background: #c9c9cb; margin: 0 auto 14px;
            }
            .rc-incoming { text-align: center; }
            .rc-incoming-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
            .rc-incoming-sub { color: var(--muted); font-size: 13px; margin-bottom: 22px; }
            .rc-incoming-actions { display: flex; gap: 16px; justify-content: center; }
            .rc-accept, .rc-decline {
                border: none; border-radius: 999px; width: 58px; height: 58px;
                font-size: 20px; cursor: pointer; color: #fff;
            }
            .rc-accept { background: #16e76d; }
            .rc-decline { background: #ff3b5c; }
            .rc-call-wrap { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; }
            .rc-status { color: var(--muted); font-size: 13px; font-weight: 600; }
            .rc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%; max-width: 860px; }
            .rc-tile { position: relative; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
            .rc-tile video { width: 100%; height: 100%; object-fit: cover; }
            .rc-tile .rc-tile-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; background: #c9c9cb; }
            .rc-tile-label { position: absolute; bottom: 6px; left: 8px; background: rgba(0,0,0,.55); padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; z-index: 2; }
            .rc-controls { display: flex; gap: 14px; }
            .rc-ctrl { width: 50px; height: 50px; border-radius: 50%; border: none; background: #1c1c1c; color: #fff; font-size: 18px; cursor: pointer; }
            .rc-ctrl:hover { background: var(--pink); }
            .rc-ctrl.off { background: #ff3b5c; }
            .rc-ctrl.end { background: #ff3b5c; }
            .rc-ctrl.end:hover { background: #d92f4d; }
        </style>
    </head>
    <body>
        <div class="app">
            <aside class="sidebar" id="sidebar">
                <div aria-hidden="true" style="position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden">
                    <input type="text" name="username" autocomplete="username" tabindex="-1">
                    <input type="password" name="password" autocomplete="current-password" tabindex="-1">
                </div>
                <div class="search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input id="searchInput" type="text" name="channel_lookup_7c91e4" autocomplete="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-form-type="other" readonly placeholder="Search users, DMs, or channels">
                </div>
                <div class="section-title">
                    Direct Messages <button id="newDmBtn">+</button>
                </div>
                <div id="dmList"></div>
                <div class="section-title">
                    Group Chats <button id="newGroupBtn">+</button>
                </div>
                <div id="groupList"></div>
                <div class="section-title">
                    Channels <button>+</button>
                </div>
                <div class="channels" id="channelList"></div>
            </aside>
            <main class="main">
                <header class="topbar">
                    <button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" type="button" aria-label="Open navigation">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <h2 id="roomTitle"># general</h2>
                    <div class="top-actions">
                        <button class="icon-btn call-icon-btn hidden" id="voiceCallBtn" type="button" title="Voice call">
                            <i class="fa-solid fa-phone"></i>
                        </button>
                        <button class="icon-btn call-icon-btn hidden" id="videoCallBtn" type="button" title="Video call">
                            <i class="fa-solid fa-video"></i>
                        </button>
                        <button class="icon-btn" id="membersBtn">
                            <i class="fa-solid fa-user-group"></i>
                        </button>
                        <button class="icon-btn" id="settingsBtn">
                            <i class="fa-solid fa-gear"></i>
                        </button>
                        <button class="icon-btn" id="chatHomeBtn" type="button" title="Back to RIW">
                            <i class="fa-solid fa-house"></i>
                        </button>
                    </div>
                </header>
                <section class="messages" id="messages"></section>
                <div class="composer-wrap">
                    <div class="composer">
                        <textarea id="composer" placeholder="You must be authenticated to chat." disabled></textarea>
                        <div class="tools">
                            <button data-format="**">
                                <b>B</b>
                            </button>
                            <button data-format="*">
                                <i>I</i>
                            </button>
                            <button data-format="~~">
                                <s>S</s>
                            </button>
                            <button data-format="__">
                                <u>U</u>
                            </button>
                            <button data-format="`">&lt;/&gt;</button>
                            <button id="gifBtn">GIF</button>
                            <button id="fileBtn">
                                <i class="fa-solid fa-file"></i>
                            </button>
                            <button data-format="# ">H1</button>
                            <button data-format="## ">H2</button>
                            <button class="send" id="sendBtn">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <aside class="rightbar">
                <h3 id="memberHeading">Online — 0</h3>
                <div id="memberList"></div>
                <div id="guestBox" class="auth-callout">
                    Create an account before you can chat, make groups, send DMs, or customize your profile.<br>
                    <br>
                    <button class="pink-btn" id="openAuthBtn">Create account</button>
                </div>
            </aside>
        </div>
        <div class="modal-backdrop" id="authModal">
            <div class="modal">
                <h2 id="authTitle">Create your RIW account</h2>
                <div class="field">
                    <label>Username</label>
                    <input id="authUsername" maxlength="22" placeholder="your_username">
                </div>
                <div class="field" id="authEmailField">
                    <label>Recovery email <span style="color:#666;font-weight:400">(optional — lets you reset your password later)</span></label>
                    <input id="authEmail" type="email" placeholder="you@example.com" autocomplete="off">
                </div>
                <div class="field">
                    <label>Password</label>
                    <input id="authPassword" type="password" minlength="6" placeholder="At least 6 characters">
                </div>
                <button type="button" id="forgotPasswordLink" style="display:none;background:none;border:0;color:var(--pink);font-size:12px;cursor:pointer;padding:0;margin:-6px 0 4px">Forgot your password?</button>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="authModal">Cancel</button>
                    <button class="ghost-btn" id="switchAuth">I already have an account</button>
                    <button class="pink-btn" id="authSubmit">Create</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="forgotModal">
            <div class="modal">
                <h2>Reset your password</h2>
                <div class="field">
                    <label>Username</label>
                    <input id="forgotUsername" placeholder="your_username">
                </div>
                <div style="color:#888;font-size:12px;line-height:1.5">If a recovery email is on file for this account, we'll send a password reset link to it. If you never added one, ask an owner for help, or log in with your current password and add one in Settings.</div>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="forgotModal">Cancel</button>
                    <button class="pink-btn" id="forgotSubmitBtn">Send reset link</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="groupModal">
            <div class="modal">
                <h2>New Group Chat</h2>
                <div class="field">
                    <label>Group Name</label>
                    <input id="groupName" placeholder="e.g. the squad">
                </div>
                <div class="field">
                    <label>Members</label>
                    <input id="groupMembers" placeholder="usernames, comma separated">
                </div>
                <small style="color:#666">You’ll be added as the owner automatically.</small>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="groupModal">Cancel</button>
                    <button class="pink-btn" id="createGroup">Create</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="dmModal">
            <div class="modal">
                <h2>Start a Direct Message</h2>
                <div class="field">
                    <label>Username</label>
                    <input id="dmUsername" placeholder="username">
                </div>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="dmModal">Cancel</button>
                    <button class="pink-btn" id="createDm">Message</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="settingsModal">
            <div class="modal">
                <h2>Profile Settings</h2>
                <div class="field">
                    <label>Display name</label>
                    <input id="setDisplay">
                </div>
                <div class="field">
                    <label>Profile picture URL</label>
                    <input id="setAvatar" placeholder="https://...">
                </div>
                <div class="field">
                    <label>Banner image URL</label>
                    <input id="setBanner" placeholder="https://...">
                </div>
                <div class="field">
                    <label>Description</label>
                    <textarea id="setBio" maxlength="180"></textarea>
                </div>
                <div class="field">
                    <label>Recovery email <span style="color:#666;font-weight:400">(lets you reset your password if forgotten)</span></label>
                    <input id="setRecoveryEmail" type="email" placeholder="you@example.com">
                </div>
                <div class="owner-panel" id="ownerPanel">
                    <div class="owner-title">
                        <i class="fa-solid fa-crown"></i>
                        Owner controls
                    </div>
                    <div class="field">
                        <label>Create role</label>
                        <div class="owner-grid">
                            <input id="newRoleName" placeholder="Role name">
                            <input id="newRoleColor" type="color" value="#ff39a5">
                        </div>
                    </div>
                    <button class="pink-btn" id="createRoleBtn" type="button">Add role</button>
                    <div class="owner-list" id="ownerUserList"></div>
                    <div class="owner-note">Owners and co-owners can manage roles, verification, and other users. The original @astrovino owner cannot be demoted.</div>
                </div>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="settingsModal">Cancel</button>
                    <button class="pink-btn" id="saveSettings">Save</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="gifModal">
            <div class="modal">
                <h2>Search GIPHY GIFs</h2>
                <div class="gif-search-row">
                    <input id="gifSearch" autocomplete="off" placeholder="Search GIPHY GIFs">
                    <button class="pink-btn" id="searchGifBtn" type="button">Search</button>
                </div>
                <div class="gif-status" id="gifStatus">Search for a GIF, then click one to send it.</div>
                <div class="gif-results" id="gifResults"></div>
                <div class="modal-actions">
                    <button class="ghost-btn" data-close="gifModal">Cancel</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="profileModal">
            <div class="profile-card">
                <div class="banner" id="profileBanner"></div>
                <button class="close-x" data-close="profileModal">×</button>
                <div class="profile-main">
                    <img class="profile-avatar" id="profileAvatar">
                    <div class="profile-name" id="profileName"></div>
                    <div class="profile-user" id="profileUser"></div>
                    <div class="profile-role-row" id="profileRoles"></div>
                    <div class="profile-bio" id="profileBio"></div>
                    <div class="profile-meta">
                        <span>
                            <b id="profileFriends">0</b>
                            friends
                        </span>
                        <span>
                            Joined <b id="profileJoined"></b>
                        </span>
                    </div>
                    <div class="profile-actions">
                        <button class="ghost-btn" id="profileMessage">
                            <i class="fa-solid fa-comment"></i>
                            Message
                        </button>
                        <button class="ghost-btn" id="profileFriend">
                            <i class="fa-solid fa-user-plus"></i>
                            Add friend
                        </button>
                    </div>
                    <div class="profile-owner-controls" id="profileOwnerControls">
                        <div class="profile-owner-title">
                            <i class="fa-solid fa-crown"></i>
                            Owner role controls
                        </div>
                        <div class="profile-owner-row">
                            <select id="profileAddRole"></select>
                            <button class="add-role-btn" id="profileAddRoleBtn">Add role</button>
                        </div>
                        <div class="profile-owner-row">
                            <select id="profileRemoveRole"></select>
                            <button class="remove-role-btn" id="profileRemoveRoleBtn">Remove role</button>
                        </div>
                        <div class="profile-owner-row">
                            <select id="profilePowerLevel">
                                <option value="member">Member</option>
                                <option value="coowner">Co-owner</option>
                                <option value="owner">Owner</option>
                            </select>
                            <button class="power-btn" id="profilePowerBtn">Set powers</button>
                        </div>
                        <div class="profile-owner-row profile-verify-row">
                            <div class="profile-verify-copy">
                                <b>Verification</b>
                                <span id="profileVerifyStatus">Not verified</span>
                            </div>
                            <button class="verify-btn" id="profileVerifyBtn">Verify</button>
                        </div>
                        <div class="profile-owner-row profile-verify-row">
                            <div class="profile-verify-copy">
                                <b>Account access</b>
                                <span id="profileBanStatus">Not banned</span>
                            </div>
                            <button class="ban-btn" id="profileBanBtn">Ban</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="message-menu" id="messageMenu">
            <button id="editMessageBtn" type="button">
                <i class="fa-solid fa-pen"></i>
                Edit message
            </button>
            <button id="unsendMessageBtn" class="danger" type="button">
                <i class="fa-solid fa-trash"></i>
                Unsend
            </button>
        </div>
        <div class="modal-backdrop" id="editMessageModal">
            <div class="modal">
                <h2>Edit message</h2>
                <div class="field">
                    <label>Update your message</label>
                    <input id="editMessageInput" maxlength="1200" autocomplete="off">
                </div>
                <div class="modal-actions">
                    <button class="ghost-btn" id="cancelEditMessageBtn" type="button">Cancel</button>
                    <button class="pink-btn" id="saveEditMessageBtn" type="button">Save changes</button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop" id="unsendMessageModal">
            <div class="modal">
                <h2>Unsend message</h2>
                <div style="color:#9a9a9a;font-size:14px;line-height:1.5">Are you sure you want to unsend this message? This cannot be undone.</div>
                <div class="modal-actions">
                    <button class="ghost-btn" id="cancelUnsendMessageBtn" type="button">Cancel</button>
                    <button class="pink-btn" id="confirmUnsendMessageBtn" type="button" style="background:#ff4f79">Unsend</button>
                </div>
            </div>
        </div>
        <div id="incomingCallOverlay">
            <div class="rc-incoming">
                <img class="rc-avatar" id="rcIncomingAvatar">
                <div class="rc-incoming-name" id="rcIncomingName"></div>
                <div class="rc-incoming-sub" id="rcIncomingSub"></div>
                <div class="rc-incoming-actions">
                    <button class="rc-decline" id="rcDeclineBtn" title="Decline"><i class="fa-solid fa-phone-slash"></i></button>
                    <button class="rc-accept" id="rcAcceptBtn" title="Accept"><i class="fa-solid fa-phone"></i></button>
                </div>
            </div>
        </div>
        <div id="activeCallOverlay">
            <div class="rc-call-wrap">
                <div class="rc-status" id="rcStatus"></div>
                <div class="rc-grid" id="rcGrid"></div>
                <div class="rc-controls">
                    <button class="rc-ctrl" id="rcMuteBtn" title="Mute"><i class="fa-solid fa-microphone"></i></button>
                    <button class="rc-ctrl" id="rcCamBtn" title="Camera"><i class="fa-solid fa-video"></i></button>
                    <button class="rc-ctrl end" id="rcEndBtn" title="End call"><i class="fa-solid fa-phone-slash"></i></button>
                </div>
            </div>
        </div>
        <div class="toast" id="toast"></div>
        <script>
            const FIREBASE_CONFIG = {
                apiKey: "AIzaSyAYVlECnmR7FK37iGGoeMzqNKpPhN6ihiw",
                authDomain: "riw-chat.firebaseapp.com",
                databaseURL: "https://riw-chat-default-rtdb.firebaseio.com",
                projectId: "riw-chat",
                storageBucket: "riw-chat.firebasestorage.app",
                messagingSenderId: "978045307627",
                appId: "1:978045307627:web:e47bfaf2d24ff7da60ccae"
            };
            const DEFAULT_AVATAR = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#f5f5f5"/><circle cx="256" cy="226" r="193" fill="#c7c8cb"/><circle cx="256" cy="211" r="72" fill="#efeff0"/><path d="M100 434c24-84 83-121 156-121s132 37 156 121" fill="#efeff0"/></svg>`);
            const channels = [['general', 'general'], ['site-requests-and-reports', 'site requests and reports'], ['announcements', 'announcements'], ['vortex', 'vortex'], ['verified', 'verified']];
            const OWNER_USERNAME = 'astrovino';
            let app, auth, db, currentUser = null, profile = null, currentRoom = {
                type: 'channel',
                id: 'general',
                name: '# general'
            }, users = {}, groups = {}, dms = {}, roles = {}, presence = {}, messagesRef = null, lastMessagesData = {}, profileTarget = null, authMode = 'signup', contextMessageId = null, pendingMessageActionId = null;
            try {
                app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
                auth = firebase.auth();
                db = firebase.database()
            } catch (e) {
                console.error(e)
            }
            let authPersistenceReady = Promise.resolve();
            if (auth) {
                authPersistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => {
                    console.warn('Could not enable local auth persistence', e)
                }
                )
            }
            const $ = id => document.getElementById(id);
            const esc = s => String(s ?? '').replace(/[&<>'"]/g, m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[m]));
            function toast(t) {
                $('toast').textContent = t;
                $('toast').classList.add('show');
                setTimeout( () => $('toast').classList.remove('show'), 2200)
            }
            function openModal(id) {
                $(id).classList.add('show')
            }
            function closeModal(id) {
                $(id).classList.remove('show')
            }
            document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
            document.querySelectorAll('.modal-backdrop').forEach(m => m.addEventListener('click', e => {
                if (e.target === m)
                    closeModal(m.id)
            }
            ));
            function syntheticEmail(u) {
                return u.toLowerCase().replace(/[^a-z0-9_.-]/g, '') + '@squiddcore.chat'
            }
            function timeAgo(ts) {
                const d = Math.max(1, Math.floor((Date.now() - ts) / 1000));
                if (d < 60)
                    return d + 's ago';
                if (d < 3600)
                    return Math.floor(d / 60) + 'm ago';
                if (d < 86400)
                    return Math.floor(d / 3600) + 'h ago';
                if (d < 2592000)
                    return Math.floor(d / 86400) + 'd ago';
                return new Date(ts).toLocaleDateString()
            }
            function accessLevel(u) {
                if (String(u?.username || '').toLowerCase() === OWNER_USERNAME)
                    return 'owner';
                return u?.accessLevel === 'owner' || u?.accessLevel === 'coowner' ? u.accessLevel : 'member'
            }
            function hasOwnerPowers(u=profile) {
                return accessLevel(u) === 'owner' || accessLevel(u) === 'coowner'
            }
            function isOwner() {
                return !!(currentUser && profile && hasOwnerPowers(profile))
            }
            function isOriginalOwner(u) {
                return String(u?.username || '').toLowerCase() === OWNER_USERNAME
            }
            function getRoleIds(u) {
                const ids = [];
                if (u && u.roleIds && typeof u.roleIds === 'object')
                    Object.entries(u.roleIds).forEach( ([id,on]) => {
                        if (on && roles[id])
                            ids.push(id)
                    }
                    );
                if (u && u.roleId && roles[u.roleId] && !ids.includes(u.roleId))
                    ids.push(u.roleId);
                return ids;
            }
            function getRoles(u) {
                return getRoleIds(u).map(id => ({
                    id,
                    ...roles[id]
                }))
            }
            function verifiedHtml(u) {
                return u && u.verified ? '<span class="verified-check" title="Verified"><i class="fa-solid fa-check"></i></span>' : ''
            }
            function roleHtml(u) {
                return getRoles(u).map(r => `<span class="role-badge" style="color:${esc(r.color || '#aaa')}">${esc(r.name || 'Role')}</span>`).join('')
            }
            function ownerBadgeHtml(u) {
                const level = accessLevel(u);
                if (level === 'owner')
                    return '<span class="role-badge" style="color:#FF0090">OWNER</span>';
                if (level === 'coowner')
                    return '<span class="role-badge" style="color:#b991ff">CO-OWNER</span>';
                return ''
            }
            function roleColor(u) {
                const r = getRoles(u)[0];
                return r && r.color ? r.color : ''
            }

            async function setUserPower(uid, level) {
                if (!isOwner())
                    return toast('Owner powers required.');
                const target = users[uid] || {};
                if (isOriginalOwner(target))
                    return toast('The original owner cannot be changed.');
                if (!['member', 'coowner', 'owner'].includes(level))
                    return toast('Choose a valid power level.');
                if (level === 'member')
                    await db.ref(`squiddChatV5/users/${uid}/accessLevel`).remove();
                else
                    await db.ref(`squiddChatV5/users/${uid}/accessLevel`).set(level);
                toast(level === 'member' ? 'Owner powers removed.' : `${level === 'coowner' ? 'Co-owner' : 'Owner'} powers granted.`);
            }
            function powerOptions(u) {
                const level = accessLevel(u);
                return `<option value="member" ${level === 'member' ? 'selected' : ''}>Member</option><option value="coowner" ${level === 'coowner' ? 'selected' : ''}>Co-owner</option><option value="owner" ${level === 'owner' ? 'selected' : ''}>Owner</option>`
            }
            async function addRoleToUser(uid, roleId) {
                if (!isOwner())
                    return toast('Owner only.');
                if (!uid || !roleId)
                    return toast('Choose a role.');
                await db.ref(`squiddChatV5/users/${uid}/roleIds/${roleId}`).set(true);
                if (users[uid]?.roleId === roleId)
                    await db.ref(`squiddChatV5/users/${uid}/roleId`).remove();
                toast('Role added.');
            }
            async function removeRoleFromUser(uid, roleId) {
                if (!isOwner())
                    return toast('Owner only.');
                if (!uid || !roleId)
                    return toast('Choose a role to remove.');
                await db.ref(`squiddChatV5/users/${uid}/roleIds/${roleId}`).remove();
                if (users[uid]?.roleId === roleId)
                    await db.ref(`squiddChatV5/users/${uid}/roleId`).remove();
                toast('Role removed.');
            }
            function roleOptions(selected='', onlyIds=null) {
                const entries = Object.entries(roles).filter( ([id]) => !onlyIds || onlyIds.includes(id));
                return '<option value="">Choose role</option>' + entries.map( ([id,r]) => `<option value="${esc(id)}" ${id === selected ? 'selected' : ''}>${esc(r.name || 'Role')}</option>`).join('');
            }
            function renderOwnerPanel() {
                const panel = $('ownerPanel');
                if (!panel)
                    return;
                panel.classList.toggle('show', isOwner());
                if (!isOwner())
                    return;
                $('ownerUserList').innerHTML = Object.entries(users).sort( (a, b) => String(a[1].username || '').localeCompare(String(b[1].username || ''))).map( ([uid,u]) => {
                    const assigned = getRoleIds(u)
                      , names = getRoles(u).map(r => r.name).join(', ') || 'No roles';
                    return `<div class="owner-user-row"><div><b>${esc(u.displayName || u.username || 'User')}</b><div style="font-size:11px;color:#777">@${esc(u.username || 'user')}</div><div class="assigned-role-summary">${esc(names)} · ${accessLevel(u) === 'member' ? 'Member' : accessLevel(u) === 'coowner' ? 'Co-owner' : 'Owner'}</div></div><select data-add-role-select="${uid}">${roleOptions()}</select><button class="add-role-btn" data-add-role="${uid}">Add role</button><select data-remove-role-select="${uid}">${roleOptions('', assigned)}</select><button class="remove-role-btn" data-remove-role="${uid}" ${assigned.length ? '' : 'disabled'}>Remove role</button><button class="verify-btn ${u.verified ? 'on' : ''}" data-verify-user="${uid}">${u.verified ? 'Verified' : 'Verify'}</button><select data-power-select="${uid}" ${isOriginalOwner(u) ? 'disabled' : ''}>${powerOptions(u)}</select><button class="power-btn ${accessLevel(u)}" data-set-power="${uid}" ${isOriginalOwner(u) ? 'disabled' : ''}>Set powers</button><button class="ban-btn ${u.banned ? 'unban' : ''}" data-ban-user="${uid}" ${isOriginalOwner(u) ? 'disabled' : ''}>${u.banned ? 'Unban' : 'Ban'}</button></div>`;
                }
                ).join('');
                document.querySelectorAll('[data-add-role]').forEach(btn => btn.onclick = () => {
                    const uid = btn.dataset.addRole
                      , sel = document.querySelector(`[data-add-role-select="${uid}"]`);
                    addRoleToUser(uid, sel?.value)
                }
                );
                document.querySelectorAll('[data-remove-role]').forEach(btn => btn.onclick = () => {
                    const uid = btn.dataset.removeRole
                      , sel = document.querySelector(`[data-remove-role-select="${uid}"]`);
                    removeRoleFromUser(uid, sel?.value)
                }
                );
                document.querySelectorAll('[data-verify-user]').forEach(btn => btn.onclick = () => db.ref(`squiddChatV5/users/${btn.dataset.verifyUser}/verified`).set(!users[btn.dataset.verifyUser]?.verified));
                document.querySelectorAll('[data-ban-user]').forEach(btn => btn.onclick = () => toggleBanUser(btn.dataset.banUser));
                document.querySelectorAll('[data-set-power]').forEach(btn => btn.onclick = () => {
                    const uid = btn.dataset.setPower
                      , sel = document.querySelector(`[data-power-select="${uid}"]`);
                    setUserPower(uid, sel?.value)
                }
                );
            }
            function roomPath() {
                if (currentRoom.type === 'channel')
                    return `squiddChatV5/messages/channels/${currentRoom.id}`;
                if (currentRoom.type === 'group')
                    return `squiddChatV5/messages/groups/${currentRoom.id}`;
                return `squiddChatV5/messages/dms/${currentRoom.id}`
            }
            function formatBody(text) {
                let out = esc(text);
                out = out.replace(/(https?:\/\/[^\s]+\.(?:gif|png|jpe?g|webp))/gi, '<img class="gif" src="$1" alt="shared image">');
                out = out.replace(/@everyone\b/gi, '<span class="mention everyone-mention">@everyone</span>');
                out = out.replace(/@([a-zA-Z0-9_.-]+)/g, '<span class="mention">@$1</span>');
                out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/~~(.+?)~~/g, '<s>$1</s>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '<code>$1</code>');
                return out.replace(/\n/g, '<br>')
            }
            function renderChannels() {
                const q = $('searchInput').value.toLowerCase();
                $('channelList').innerHTML = channels.filter(x => x[1].includes(q)).map( ([id,n]) => `<button class="nav-item ${currentRoom.type === 'channel' && currentRoom.id === id ? 'active' : ''}" data-room="channel:${id}"><span>#</span>${esc(n)}</button>`).join('')
            }
            function renderDms() {
                const q = $('searchInput').value.toLowerCase();
                const arr = Object.entries(dms).filter( ([,v]) => v.members && v.members[currentUser?.uid]);
                $('dmList').innerHTML = arr.map( ([id,v]) => {
                    const uid = Object.keys(v.members).find(x => x !== currentUser.uid)
                      , u = users[uid] || {};
                    if (q && !`${u.displayName || ''} ${u.username || ''}`.toLowerCase().includes(q))
                        return '';
                    return `<button class="nav-item ${currentRoom.type === 'dm' && currentRoom.id === id ? 'active' : ''}" data-room="dm:${id}"><img class="avatar" src="${esc(u.avatar || DEFAULT_AVATAR)}"><span>${esc(u.displayName || u.username || 'User')}</span></button>`
                }
                ).join('') || '<div style="color:#555;font-size:12px;padding:5px">No DMs yet</div>'
            }
            function renderGroups() {
                const q = $('searchInput').value.toLowerCase();
                $('groupList').innerHTML = Object.entries(groups).filter( ([,g]) => g.members && g.members[currentUser?.uid] && (!q || g.name.toLowerCase().includes(q))).map( ([id,g]) => `<button class="nav-item ${currentRoom.type === 'group' && currentRoom.id === id ? 'active' : ''}" data-room="group:${id}"><span>👥</span><span>${esc(g.name)}</span></button>`).join('') || '<div style="color:#555;font-size:12px;padding:5px">No groups yet</div>'
            }
            function bindRoomButtons() {
                document.querySelectorAll('[data-room]').forEach(b => b.onclick = () => {
                    const [type,id] = b.dataset.room.split(':');
                    let name = type === 'channel' ? '# ' + channels.find(x => x[0] === id)?.[1] : type === 'group' ? groups[id]?.name : 'Direct Message';
                    selectRoom(type, id, name)
                }
                )
            }
            function renderSidebar() {
                renderChannels();
                if (currentUser) {
                    renderDms();
                    renderGroups()
                } else {
                    $('dmList').innerHTML = '<div style="color:#555;font-size:12px;padding:5px">Sign in to use DMs</div>';
                    $('groupList').innerHTML = '<div style="color:#555;font-size:12px;padding:5px">Sign in to make groups</div>'
                }
                bindRoomButtons()
            }
            function canTypeInCurrentRoom() {
                if (!currentUser || !profile)
                    return false;
                if (currentRoom.type === 'channel' && currentRoom.id === 'announcements')
                    return hasOwnerPowers(profile) || !!profile.verified;
                return true
            }
            function updateComposerPermission() {
                const c = $('composer')
                  , tools = document.querySelector('.tools');
                if (!currentUser) {
                    c.disabled = true;
                    c.placeholder = 'You must be authenticated to chat.';
                    if (tools)
                        tools.style.display = 'flex';
                    return
                }
                const allowed = canTypeInCurrentRoom();
                c.disabled = !allowed;
                c.placeholder = allowed ? 'Message ' + currentRoom.name : 'You do not have permission to type in this channel.';
                if (tools)
                    tools.style.opacity = allowed ? '1' : '.4';
                document.querySelectorAll('.tools button').forEach(b => b.disabled = !allowed)
            }
            function selectRoom(type, id, name) {
                currentRoom = {
                    type,
                    id,
                    name
                };
                $('roomTitle').textContent = name;
                $('searchInput').value = '';
                renderSidebar();
                listenMessages();
                updateComposerPermission();
                renderMembers();
                updateComposerPermission()
            }
            function listenMessages() {
                if (messagesRef)
                    messagesRef.off();
                messagesRef = db.ref(roomPath()).limitToLast(150);
                messagesRef.on('value', snap => {
                    lastMessagesData = snap.val() || {};
                    renderMessages(lastMessagesData)
                }
                )
            }
            function renderMessages(data) {
                const entries = Object.entries(data).sort( (a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
                if (!entries.length) {
                    $('messages').innerHTML = '<div class="empty"><div><h3>No messages yet</h3><p>Start the conversation.</p></div></div>';
                    return
                }
                $('messages').innerHTML = entries.map( ([id,m]) => {
                    const u = users[m.uid] || m.user || {};
                    const own = currentUser && m.uid === currentUser.uid;
                    return `<article class="message" data-message-id="${esc(id)}" data-own="${own ? 'true' : 'false'}"><img class="avatar profile-open" data-uid="${esc(m.uid)}" src="${esc(u.avatar || DEFAULT_AVATAR)}"><div><div class="message-head"><span class="display profile-open" data-uid="${esc(m.uid)}" style="color:${esc(roleColor(u) || '#fff')}">${esc(u.displayName || u.username || 'User')}</span>${verifiedHtml(u)}${ownerBadgeHtml(u)}<span class="username">@${esc(u.username || 'user')}</span><span class="ago">${timeAgo(m.timestamp || Date.now())}</span>${m.editedAt ? '<span class="edited-label">(edited)</span>' : ''}</div><div class="body">${formatBody(m.text || '')}</div></div></article>`
                }
                ).join('');
                $('messages').scrollTop = $('messages').scrollHeight;
                document.querySelectorAll('.profile-open').forEach(x => x.onclick = () => showProfile(x.dataset.uid));
                document.querySelectorAll('.message[data-own="true"]').forEach(el => el.addEventListener('contextmenu', openMessageMenu))
            }
            function renderMembers() {
                let ids = [];
                if (currentRoom.type === 'channel')
                    ids = Object.keys(users);
                else if (currentRoom.type === 'group')
                    ids = Object.keys(groups[currentRoom.id]?.members || {});
                else
                    ids = Object.keys(dms[currentRoom.id]?.members || {});
                const sorted = ids.filter(uid => users[uid]).sort( (a, b) => {
                    const ao = !!presence[a]?.online
                      , bo = !!presence[b]?.online;
                    if (ao !== bo)
                        return ao ? -1 : 1;
                    return String(users[a]?.displayName || users[a]?.username || '').localeCompare(String(users[b]?.displayName || users[b]?.username || ''));
                }
                );
                const online = sorted.filter(uid => !!presence[uid]?.online)
                  , offline = sorted.filter(uid => !presence[uid]?.online);
                const row = uid => {
                    const u = users[uid] || {}
                      , isOnline = !!presence[uid]?.online;
                    return `<div class="member profile-open ${isOnline ? '' : 'offline'}" data-uid="${esc(uid)}"><img class="avatar" src="${esc(u.avatar || DEFAULT_AVATAR)}"><div><b style="font-size:12px;color:${esc(roleColor(u) || '#fff')}">${esc(u.displayName || u.username || 'User')}</b>${verifiedHtml(u)}${ownerBadgeHtml(u)}${u.banned ? '<span class="banned-label">BANNED</span>' : ''}<div style="font-size:10px;color:#666">@${esc(u.username || 'user')}</div></div><span class="status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Online' : 'Offline'}"></span></div>`
                }
                ;
                let html = '';
                if (online.length)
                    html += `<div class="member-section-label">Online — ${online.length}</div>` + online.map(row).join('');
                if (offline.length)
                    html += `<div class="member-section-label">Offline — ${offline.length}</div>` + offline.map(row).join('');
                $('memberList').innerHTML = html || '<div style="color:#555;font-size:12px;padding:8px 2px">No members yet.</div>';
                $('memberHeading').textContent = `Members — ${sorted.length}`;
                document.querySelectorAll('.profile-open').forEach(x => x.onclick = () => showProfile(x.dataset.uid));
            }
            async function sendMessage() {
                const text = $('composer').value.trim();
                if (!currentUser)
                    return openModal('authModal');
                if (profile?.banned)
                    return toast('This account is banned.');
                if (!canTypeInCurrentRoom())
                    return toast('You do not have permission to type in this channel.');
                if (!text)
                    return;
                await db.ref(roomPath()).push({
                    uid: currentUser.uid,
                    text,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                $('composer').value = ''
            }
            function renderProfileOwnerControls(uid) {
                const box = $('profileOwnerControls');
                if (!box)
                    return;
                const can = isOwner() && !!uid;
                box.classList.toggle('show', can);
                if (!can)
                    return;
                const assigned = getRoleIds(users[uid] || {});
                $('profileAddRole').innerHTML = roleOptions();
                $('profileRemoveRole').innerHTML = roleOptions('', assigned);
                $('profileRemoveRoleBtn').disabled = !assigned.length;
                $('profilePowerLevel').innerHTML = powerOptions(users[uid] || {});
                $('profilePowerLevel').disabled = isOriginalOwner(users[uid]);
                $('profilePowerBtn').disabled = isOriginalOwner(users[uid]);
                const verifyBtn = $('profileVerifyBtn');
                const verifyStatus = $('profileVerifyStatus');
                if (verifyBtn) {
                    const verified = !!users[uid]?.verified;
                    verifyBtn.textContent = verified ? 'Unverify' : 'Verify';
                    verifyBtn.classList.toggle('on', verified);
                    verifyBtn.disabled = isOriginalOwner(users[uid]);
                }
                if (verifyStatus)
                    verifyStatus.textContent = users[uid]?.verified ? 'Verified account' : 'Not verified';
                const banBtn = $('profileBanBtn')
                  , banStatus = $('profileBanStatus');
                if (banBtn) {
                    const banned = !!users[uid]?.banned;
                    banBtn.textContent = banned ? 'Unban' : 'Ban';
                    banBtn.classList.toggle('unban', banned);
                    banBtn.disabled = isOriginalOwner(users[uid]) || uid === currentUser?.uid;
                }
                if (banStatus)
                    banStatus.textContent = users[uid]?.banned ? 'Banned from RIW Chat' : 'Not banned';
            }
            async function toggleBanUser(uid) {
                if (!isOwner())
                    return toast('Owner only.');
                const target = users[uid];
                if (!target)
                    return toast('User not found.');
                if (isOriginalOwner(target))
                    return toast('The original owner cannot be banned.');
                if (uid === currentUser?.uid)
                    return toast('You cannot ban yourself.');
                const next = !target.banned;
                await db.ref(`squiddChatV5/users/${uid}`).update({
                    banned: next,
                    bannedAt: next ? firebase.database.ServerValue.TIMESTAMP : null,
                    bannedBy: next ? currentUser.uid : null
                });
                if (next)
                    await db.ref(`squiddChatV5/presence/${uid}`).update({
                        online: false,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    });
                toast(next ? 'User banned.' : 'User unbanned.');
            }
            function showProfile(uid) {
                const u = users[uid];
                if (!u)
                    return;
                profileTarget = uid;
                $('profileBanner').style.backgroundImage = u.banner ? `url("${u.banner.replace(/"/g, '')}")` : 'none';
                $('profileAvatar').src = u.avatar || DEFAULT_AVATAR;
                $('profileName').innerHTML = esc(u.displayName || u.username) + verifiedHtml(u);
                $('profileName').style.color = roleColor(u) || '#fff';
                $('profileUser').textContent = '@' + (u.username || 'user');
                $('profileRoles').innerHTML = roleHtml(u);
                $('profileBio').textContent = u.bio || 'No description yet.';
                $('profileFriends').textContent = Object.keys(u.friends || {}).length;
                $('profileJoined').textContent = new Date(u.joinedAt || Date.now()).toLocaleString('en', {
                    month: 'long',
                    year: 'numeric'
                });
                $('profileFriend').style.display = uid === currentUser?.uid ? 'none' : '';
                $('profileMessage').style.display = uid === currentUser?.uid ? 'none' : '';
                renderProfileOwnerControls(uid);
                openModal('profileModal')
            }
            async function startDmWith(uid) {
                if (!currentUser)
                    return openModal('authModal');
                const id = [currentUser.uid, uid].sort().join('_');
                await db.ref(`squiddChatV5/dms/${id}`).update({
                    members: {
                        [currentUser.uid]: true,
                        [uid]: true
                    },
                    updatedAt: Date.now()
                });
                closeModal('profileModal');
                selectRoom('dm', id, 'Direct Message')
            }
            function isValidEmail(e) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
            }
            async function authSubmit() {
                const username = $('authUsername').value.trim().toLowerCase()
                  , password = $('authPassword').value
                  , recoveryEmail = $('authEmail').value.trim();
                if (!/^[a-z0-9_.-]{3,22}$/.test(username))
                    return toast('Use 3–22 letters, numbers, dots, dashes, or underscores.');
                if (password.length < 6)
                    return toast('Password must be at least 6 characters.');
                if (authMode === 'signup' && recoveryEmail && !isValidEmail(recoveryEmail))
                    return toast('Enter a valid recovery email, or leave it blank.');
                try {
                    await authPersistenceReady;
                    if (authMode === 'signup') {
                        const taken = (await db.ref(`squiddChatV5/usernames/${username}`).once('value')).val();
                        if (taken)
                            return toast('That username is already taken.');
                        const authEmail = recoveryEmail || syntheticEmail(username);
                        const cred = await auth.createUserWithEmailAndPassword(authEmail, password);
                        await db.ref(`squiddChatV5/users/${cred.user.uid}`).set({
                            username,
                            displayName: username,
                            avatar: '',
                            banner: '',
                            bio: '',
                            authEmail,
                            recoveryEmail: recoveryEmail || null,
                            joinedAt: firebase.database.ServerValue.TIMESTAMP,
                            friends: {}
                        });
                        await db.ref(`squiddChatV5/usernames/${username}`).set(cred.user.uid)
                    } else {
                        const uid = (await db.ref(`squiddChatV5/usernames/${username}`).once('value')).val();
                        const storedEmail = uid ? (await db.ref(`squiddChatV5/users/${uid}/authEmail`).once('value')).val() : null;
                        await auth.signInWithEmailAndPassword(storedEmail || syntheticEmail(username), password);
                    }
                    closeModal('authModal')
                } catch (e) {
                    toast(e.message.replace('Firebase:', '').replace(/\(auth\/.+\)\.?/, '').trim())
                }
            }
            async function sendForgotPasswordEmail() {
                const username = $('forgotUsername').value.trim().toLowerCase();
                if (!username)
                    return toast('Enter your username.');
                try {
                    const uid = (await db.ref(`squiddChatV5/usernames/${username}`).once('value')).val();
                    if (!uid)
                        return toast('No account found with that username.');
                    const authEmail = (await db.ref(`squiddChatV5/users/${uid}/authEmail`).once('value')).val();
                    if (!authEmail)
                        return toast('No recovery email is set for this account.');
                    await auth.sendPasswordResetEmail(authEmail);
                    toast('Reset link sent — check that inbox.');
                    closeModal('forgotModal')
                } catch (e) {
                    toast(e.message.replace('Firebase:', '').replace(/\(auth\/.+\)\.?/, '').trim())
                }
            }
            async function setAuthed(user) {
                currentUser = user;
                profile = user ? (users[user.uid] || null) : null;
                $('guestBox').style.display = user ? 'none' : 'block';
                $('newGroupBtn').disabled = !user;
                $('newDmBtn').disabled = !user;
                if (user && !profile) {
                    try {
                        const snap = await db.ref(`squiddChatV5/users/${user.uid}`).once('value');
                        profile = snap.val() || null;
                        if (profile)
                            users[user.uid] = profile
                    } catch (e) {
                        console.warn('Could not restore saved profile', e)
                    }
                }
                if (user && profile?.banned) {
                    try {
                        await auth.signOut()
                    } catch (e) {}
                    currentUser = null;
                    profile = null;
                    toast('This account has been banned from RIW Chat.');
                }
                if (user && profile && user.email && profile.authEmail !== user.email) {
                    // A pending recovery-email change (verifyBeforeUpdateEmail) was confirmed
                    // since we last saw this account — sync the stored login email.
                    db.ref(`squiddChatV5/users/${user.uid}/authEmail`).set(user.email).catch(() => {})
                }
                renderSidebar();
                renderMembers();
                renderMessages(lastMessagesData);
                renderOwnerPanel();
                updateComposerPermission()
            }
            function updateAuthModeUI() {
                $('authTitle').textContent = authMode === 'signup' ? 'Create your RIW account' : 'Log in to RIW';
                $('authSubmit').textContent = authMode === 'signup' ? 'Create' : 'Log in';
                $('switchAuth').textContent = authMode === 'signup' ? 'I already have an account' : 'I need an account';
                $('authEmailField').style.display = authMode === 'signup' ? '' : 'none';
                $('forgotPasswordLink').style.display = authMode === 'login' ? '' : 'none'
            }
            $('openAuthBtn').onclick = () => openModal('authModal');
            $('authSubmit').onclick = authSubmit;
            $('switchAuth').onclick = () => {
                authMode = authMode === 'signup' ? 'login' : 'signup';
                updateAuthModeUI()
            }
            ;
            $('forgotPasswordLink').onclick = () => {
                $('forgotUsername').value = $('authUsername').value.trim();
                closeModal('authModal');
                openModal('forgotModal')
            }
            ;
            $('forgotSubmitBtn').onclick = sendForgotPasswordEmail;
            updateAuthModeUI();
            $('newGroupBtn').onclick = () => currentUser ? openModal('groupModal') : openModal('authModal');
            $('newDmBtn').onclick = () => currentUser ? openModal('dmModal') : openModal('authModal');
            $('createGroup').onclick = async () => {
                if (!currentUser)
                    return;
                const name = $('groupName').value.trim()
                  , names = $('groupMembers').value.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
                if (!name)
                    return toast('Enter a group name.');
                const members = {
                    [currentUser.uid]: true
                };
                for (const n of names) {
                    const uid = (await db.ref(`squiddChatV5/usernames/${n}`).once('value')).val();
                    if (uid)
                        members[uid] = true
                }
                const ref = db.ref('squiddChatV5/groups').push();
                await ref.set({
                    name,
                    owner: currentUser.uid,
                    members,
                    createdAt: Date.now()
                });
                closeModal('groupModal');
                selectRoom('group', ref.key, name)
            }
            ;
            $('createDm').onclick = async () => {
                const name = $('dmUsername').value.trim().toLowerCase()
                  , uid = (await db.ref(`squiddChatV5/usernames/${name}`).once('value')).val();
                if (!uid)
                    return toast('User not found.');
                if (uid === currentUser.uid)
                    return toast('You cannot DM yourself.');
                closeModal('dmModal');
                startDmWith(uid)
            }
            ;
            $('settingsBtn').onclick = () => {
                if (!currentUser)
                    return openModal('authModal');
                $('setDisplay').value = profile?.displayName || '';
                $('setAvatar').value = profile?.avatar || '';
                $('setBanner').value = profile?.banner || '';
                $('setBio').value = profile?.bio || '';
                $('setRecoveryEmail').value = profile?.recoveryEmail || '';
                renderOwnerPanel();
                openModal('settingsModal')
            }
            ;
            async function updateRecoveryEmail(newEmail) {
                try {
                    await auth.currentUser.verifyBeforeUpdateEmail(newEmail);
                } catch (e) {
                    if (e.code === 'auth/requires-recent-login') {
                        const pwd = prompt('For security, re-enter your current password to change your recovery email:');
                        if (!pwd)
                            throw new Error('Recovery email not changed.');
                        const cred = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, pwd);
                        await auth.currentUser.reauthenticateWithCredential(cred);
                        await auth.currentUser.verifyBeforeUpdateEmail(newEmail)
                    } else
                        throw e
                }
                await db.ref(`squiddChatV5/users/${currentUser.uid}`).update({
                    recoveryEmail: newEmail
                });
                toast('Check ' + newEmail + ' for a link to confirm the change.')
            }
            $('saveSettings').onclick = async () => {
                await db.ref(`squiddChatV5/users/${currentUser.uid}`).update({
                    displayName: $('setDisplay').value.trim() || profile.username,
                    avatar: $('setAvatar').value.trim(),
                    banner: $('setBanner').value.trim(),
                    bio: $('setBio').value.trim()
                });
                const newRecoveryEmail = $('setRecoveryEmail').value.trim();
                const currentRecoveryEmail = profile?.recoveryEmail || '';
                if (newRecoveryEmail && newRecoveryEmail !== currentRecoveryEmail) {
                    if (!isValidEmail(newRecoveryEmail)) {
                        toast('Profile saved, but that recovery email looks invalid.')
                    } else {
                        try {
                            await updateRecoveryEmail(newRecoveryEmail)
                        } catch (e) {
                            toast('Profile saved, but recovery email update failed: ' + e.message.replace('Firebase:', '').trim())
                        }
                    }
                } else {
                    toast('Profile saved.')
                }
                closeModal('settingsModal')
            }
            ;
            $('createRoleBtn').onclick = async () => {
                if (!isOwner())
                    return toast('Owner only.');
                const name = $('newRoleName').value.trim()
                  , color = $('newRoleColor').value;
                if (!name)
                    return toast('Enter a role name.');
                await db.ref('squiddChatV5/roles').push({
                    name,
                    color,
                    createdAt: Date.now(),
                    createdBy: currentUser.uid
                });
                $('newRoleName').value = '';
                renderOwnerPanel();
                toast('Role created.')
            }
            ;
            $('profileAddRoleBtn').onclick = async () => {
                await addRoleToUser(profileTarget, $('profileAddRole').value);
                showProfile(profileTarget)
            }
            ;
            $('profileRemoveRoleBtn').onclick = async () => {
                await removeRoleFromUser(profileTarget, $('profileRemoveRole').value);
                showProfile(profileTarget)
            }
            ;
            $('profilePowerBtn').onclick = async () => {
                await setUserPower(profileTarget, $('profilePowerLevel').value);
                showProfile(profileTarget)
            }
            ;
            $('profileVerifyBtn').onclick = async () => {
                if (!profileTarget || !isOwner())
                    return;
                const target = users[profileTarget];
                if (!target || isOriginalOwner(target))
                    return;
                await db.ref(`squiddChatV5/users/${profileTarget}/verified`).set(!target.verified);
                toast(target.verified ? 'User unverified.' : 'User verified.');
                showProfile(profileTarget)
            }
            ;
            $('profileBanBtn').onclick = async () => {
                await toggleBanUser(profileTarget);
                showProfile(profileTarget)
            }
            ;
            $('profileMessage').onclick = () => startDmWith(profileTarget);
            $('profileFriend').onclick = async () => {
                if (!currentUser)
                    return openModal('authModal');
                await db.ref(`squiddChatV5/users/${currentUser.uid}/friends/${profileTarget}`).set(true);
                await db.ref(`squiddChatV5/users/${profileTarget}/friends/${currentUser.uid}`).set(true);
                toast('Friend added.');
                showProfile(profileTarget)
            }
            ;
            $('gifBtn').onclick = () => {
                if (!currentUser)
                    return openModal('authModal');
                $('gifSearch').value = '';
                $('gifResults').innerHTML = '';
                $('gifStatus').textContent = 'Search GIPHY GIFs.';
                openModal('gifModal');
                setTimeout( () => $('gifSearch').focus(), 30)
            }
            ;
            $('fileBtn').onclick = () => toast('Paste an image or GIF URL into the message for now.');

            const GIPHY_API_KEY = 'FZCA7C1Ii7de7C2Uk6Tt68nF5jiUS0K5';
            async function searchGiphy() {
                const q = $('gifSearch').value.trim();
                if (!q) {
                    $('gifStatus').textContent = 'Type something to search GIPHY.';
                    return
                }
                $('gifStatus').textContent = 'Searching GIPHY…';
                $('gifResults').innerHTML = '';
                try {
                    const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(GIPHY_API_KEY)}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13&lang=en&bundle=messaging_non_clips`;
                    const r = await fetch(url);
                    if (!r.ok)
                        throw new Error('GIPHY request failed');
                    const d = await r.json();
                    const results = Array.isArray(d.data) ? d.data : [];
                    $('gifStatus').textContent = results.length ? `GIPHY results for “${q}”` : 'No GIFs found.';
                    $('gifResults').innerHTML = results.map( (g, i) => {
                        const src = g?.images?.fixed_width?.url || g?.images?.downsized?.url || g?.images?.original?.url || '';
                        const preview = g?.images?.fixed_width_small?.url || src;
                        return src ? `<button class="gif-result" type="button" data-gif-url="${esc(src)}"><img src="${esc(preview)}" alt="GIPHY GIF result ${i + 1}" loading="lazy"></button>` : '';
                    }
                    ).join('');
                    document.querySelectorAll('[data-gif-url]').forEach(b => b.onclick = () => {
                        const u = b.dataset.gifUrl;
                        $('composer').value += ($('composer').value ? '\n' : '') + u;
                        closeModal('gifModal');
                        $('composer').focus();
                    }
                    );
                } catch (e) {
                    console.error(e);
                    $('gifStatus').textContent = 'GIPHY search could not load. Please try again.';
                }
            }
            $('searchGifBtn').onclick = searchGiphy;
            $('gifSearch').addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchGiphy()
                }
            }
            );

            function openMessageMenu(e) {
                e.preventDefault();
                contextMessageId = e.currentTarget.dataset.messageId;
                const menu = $('messageMenu');
                menu.style.left = Math.min(e.clientX, window.innerWidth - 170) + 'px';
                menu.style.top = Math.min(e.clientY, window.innerHeight - 100) + 'px';
                menu.classList.add('show')
            }
            function closeMessageMenu() {
                $('messageMenu').classList.remove('show');
                contextMessageId = null
            }
            function resetMessageActionModals() {
                pendingMessageActionId = null;
                $('editMessageInput').value = '';
                closeModal('editMessageModal');
                closeModal('unsendMessageModal')
            }
            function openEditMessageModal(messageId, text) {
                pendingMessageActionId = messageId;
                $('editMessageInput').value = text || '';
                openModal('editMessageModal');
                setTimeout( () => {
                    $('editMessageInput').focus();
                    $('editMessageInput').select()
                }
                , 20)
            }
            function openUnsendMessageModal(messageId) {
                pendingMessageActionId = messageId;
                openModal('unsendMessageModal')
            }
            document.addEventListener('click', e => {
                if (!e.target.closest('#messageMenu'))
                    closeMessageMenu()
            }
            );
            window.addEventListener('blur', closeMessageMenu);
            window.addEventListener('resize', closeMessageMenu);
            $('editMessageBtn').onclick = () => {
                const id = contextMessageId
                  , m = lastMessagesData[id];
                closeMessageMenu();
                if (!id || !m || m.uid !== currentUser?.uid)
                    return;
                openEditMessageModal(id, m.text || '')
            }
            ;
            $('unsendMessageBtn').onclick = () => {
                const id = contextMessageId
                  , m = lastMessagesData[id];
                closeMessageMenu();
                if (!id || !m || m.uid !== currentUser?.uid)
                    return;
                openUnsendMessageModal(id)
            }
            ;
            $('cancelEditMessageBtn').onclick = resetMessageActionModals;
            $('cancelUnsendMessageBtn').onclick = resetMessageActionModals;
            $('saveEditMessageBtn').onclick = async () => {
                const id = pendingMessageActionId
                  , m = lastMessagesData[pendingMessageActionId];
                if (!id || !m || m.uid !== currentUser?.uid)
                    return resetMessageActionModals();
                const clean = $('editMessageInput').value.trim();
                if (!clean)
                    return toast('Message cannot be empty.');
                await db.ref(roomPath() + '/' + id).update({
                    text: clean,
                    editedAt: firebase.database.ServerValue.TIMESTAMP
                });
                resetMessageActionModals();
                toast('Message edited.')
            }
            ;
            $('confirmUnsendMessageBtn').onclick = async () => {
                const id = pendingMessageActionId
                  , m = lastMessagesData[pendingMessageActionId];
                if (!id || !m || m.uid !== currentUser?.uid)
                    return resetMessageActionModals();
                await db.ref(roomPath() + '/' + id).remove();
                resetMessageActionModals();
                toast('Message unsent.')
            }
            ;
            $('editMessageInput').addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    $('saveEditMessageBtn').click()
                } else if (e.key === 'Escape') {
                    resetMessageActionModals()
                }
            }
            );
            function hardenSearchInput() {
                const old = $('searchInput');
                if (!old)
                    return;
                const el = old.cloneNode(true);
                old.replaceWith(el);
                el.value = '';
                el.defaultValue = '';
                el.setAttribute('value', '');
                el.readOnly = true;
                const clearAutofill = () => {
                    if (document.activeElement !== el || String(el.value).toLowerCase() === 'astrovino') {
                        el.value = '';
                        el.defaultValue = '';
                        el.setAttribute('value', '')
                    }
                }
                ;
                el.addEventListener('pointerdown', () => {
                    el.readOnly = false;
                    clearAutofill()
                }
                , {
                    once: true
                });
                el.addEventListener('keydown', () => {
                    el.readOnly = false
                }
                , {
                    once: true
                });
                el.addEventListener('focus', () => {
                    el.readOnly = false;
                    clearAutofill()
                }
                );
                el.addEventListener('input', () => {
                    renderSidebar()
                }
                );
                window.addEventListener('pageshow', clearAutofill);
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden)
                        clearAutofill()
                }
                );
                [0, 50, 150, 350, 700, 1200, 2000].forEach(ms => setTimeout(clearAutofill, ms));
                setTimeout( () => {
                    el.readOnly = false;
                    clearAutofill()
                }
                , 300);
            }
            document.addEventListener('DOMContentLoaded', hardenSearchInput);
            window.addEventListener('pageshow', hardenSearchInput);
            setTimeout(hardenSearchInput, 700);

            document.querySelectorAll('[data-format]').forEach(b => b.onclick = () => {
                const t = $('composer')
                  , f = b.dataset.format
                  , s = t.selectionStart
                  , e = t.selectionEnd
                  , v = t.value;
                if (f.endsWith(' ')) {
                    t.value = v.slice(0, s) + f + v.slice(s)
                } else
                    t.value = v.slice(0, s) + f + v.slice(s, e) + f + v.slice(e);
                t.focus()
            }
            );
            $('sendBtn').onclick = sendMessage;
            $('composer').addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage()
                }
            }
            );
            $('searchInput').oninput = renderSidebar;
            $('membersBtn').onclick = () => document.querySelector('.rightbar').classList.toggle('show');
            db.ref('squiddChatV5/users').on('value', async s => {
                users = s.val() || {};
                profile = currentUser ? users[currentUser.uid] || profile : null;
                if (currentUser && profile?.banned) {
                    try {
                        await auth.signOut()
                    } catch (e) {}
                    toast('This account has been banned from RIW Chat.');
                    return
                }
                renderSidebar();
                renderMembers();
                renderMessages(lastMessagesData);
                renderOwnerPanel();
                updateComposerPermission();
                if (profileTarget && $('profileModal').classList.contains('show'))
                    showProfile(profileTarget)
            }
            );
            db.ref('squiddChatV5/presence').on('value', s => {
                presence = s.val() || {};
                renderMembers()
            }
            );
            db.ref('squiddChatV5/roles').on('value', s => {
                roles = s.val() || {};
                renderMembers();
                renderMessages(lastMessagesData);
                renderOwnerPanel();
                if (profileTarget && $('profileModal').classList.contains('show'))
                    showProfile(profileTarget)
            }
            );
            db.ref('squiddChatV5/groups').on('value', s => {
                groups = s.val() || {};
                renderSidebar()
            }
            );
            db.ref('squiddChatV5/dms').on('value', s => {
                dms = s.val() || {};
                renderSidebar()
            }
            );
            authPersistenceReady.finally( () => auth.onAuthStateChanged(async u => {
                await setAuthed(u);
                if (u && users[u.uid]?.banned) {
                    await auth.signOut();
                    return
                }
                if (u) {
                    const presenceRef = db.ref(`squiddChatV5/presence/${u.uid}`);
                    presenceRef.onDisconnect().set({
                        online: false,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    });
                    presenceRef.set({
                        online: true,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    })
                }
            }
            ));
            $('searchInput').value = '';
            renderSidebar();
            listenMessages();
            updateComposerPermission();
        </script>
        <script id="sq-chat-no-leave-warning-fix">
            (function() {
                function disableLeaveWarning() {
                    try {
                        localStorage.setItem('leaveWarning', 'false');
                        localStorage.setItem('squiddcoreConfirmBeforeLeaving', 'false');
                    } catch (e) {}
                    var a = document.getElementById('leaveWarningToggle');
                    var b = document.getElementById('miiConfirmBeforeLeavingToggle');
                    if (a)
                        a.checked = false;
                    if (b)
                        b.checked = false;
                }
                disableLeaveWarning();
                document.addEventListener('click', function(e) {
                    var el = e.target.closest('a,button,[data-screen],[data-route],[data-open]');
                    if (!el)
                        return;
                    var hay = [el.getAttribute('href'), el.getAttribute('onclick'), el.dataset && el.dataset.screen, el.dataset && el.dataset.route, el.dataset && el.dataset.open, el.textContent].join(' ').toLowerCase();
                    if (hay.indexOf('chat') !== -1)
                        disableLeaveWarning();
                }, true);
                window.addEventListener('pageshow', disableLeaveWarning);
            }
            )();
        </script>
        <script id="sq-chat-home-fix">
            (function() {
                const btn = document.getElementById('chatHomeBtn');
                if (!btn)
                    return;
                btn.addEventListener('click', function() {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({
                            type: 'sq-close-chat'
                        }, '*');
                    } else {
                        window.location.replace('index.html');
                    }
                });
            }
            )();
        </script>
        <script id="riw-smooth-motion-pack">
            (function() {
                const q = (s, r=document) => r.querySelector(s);
                const qa = (s, r=document) => Array.from(r.querySelectorAll(s));
                const seenMessages = new Set();

                function animateMessages() {
                    const items = qa('.message');
                    items.forEach( (el, index) => {
                        const id = el.dataset.messageId || String(index);
                        if (seenMessages.has(id))
                            return;
                        seenMessages.add(id);
                        el.classList.remove('riw-enter');
                        el.style.animationDelay = Math.min(index, 8) * 24 + 'ms';
                        requestAnimationFrame( () => el.classList.add('riw-enter'));
                    }
                    );
                }

                function animateMembers() {
                    qa('.member').forEach( (el, index) => {
                        if (el.dataset.riwAnimated)
                            return;
                        el.dataset.riwAnimated = '1';
                        el.style.animationDelay = Math.min(index, 10) * 20 + 'ms';
                        el.classList.add('riw-enter');
                    }
                    );
                }

                function animateRoom() {
                    const messages = q('#messages');
                    const title = q('#roomTitle');
                    if (messages) {
                        messages.classList.remove('riw-room-switch');
                        void messages.offsetWidth;
                        messages.classList.add('riw-room-switch')
                    }
                    if (title) {
                        title.classList.remove('riw-room-switch');
                        void title.offsetWidth;
                        title.classList.add('riw-room-switch')
                    }
                }

                function wireMotion() {
                    const messages = q('#messages');
                    const members = q('#memberList') || q('.rightbar');
                    if (messages) {
                        new MutationObserver( () => requestAnimationFrame(animateMessages)).observe(messages, {
                            childList: true,
                            subtree: false
                        });
                        animateMessages();
                    }
                    if (members) {
                        new MutationObserver( () => requestAnimationFrame(animateMembers)).observe(members, {
                            childList: true,
                            subtree: true
                        });
                        animateMembers();
                    }

                    document.addEventListener('click', function(e) {
                        const room = e.target.closest('[data-room-type],.channels .nav-item');
                        if (room)
                            setTimeout(animateRoom, 0);
                        const send = e.target.closest('#sendBtn');
                        if (send) {
                            send.classList.remove('riw-send-pop');
                            void send.offsetWidth;
                            send.classList.add('riw-send-pop')
                        }
                    }, true);

                    const composer = q('#composer');
                    if (composer) {
                        composer.addEventListener('input', function() {
                            this.style.height = 'auto';
                            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
                        });
                    }
                }

                if (document.readyState === 'loading')
                    document.addEventListener('DOMContentLoaded', wireMotion);
                else
                    wireMotion();
            }
            )();
        </script>
        <script id="riw-mobile-layout-script">
            (function() {
                const sidebar = document.getElementById('sidebar');
                const rightbar = document.querySelector('.rightbar');
                const menu = document.getElementById('mobileMenuBtn');
                const members = document.getElementById('membersBtn');
                function isMobile() {
                    return window.matchMedia('(max-width:680px)').matches
                }
                function closePanels() {
                    sidebar?.classList.remove('open');
                    rightbar?.classList.remove('show')
                }
                menu?.addEventListener('click', function(e) {
                    e.stopPropagation();
                    rightbar?.classList.remove('show');
                    sidebar?.classList.toggle('open')
                });
                members?.addEventListener('click', function(e) {
                    if (window.matchMedia('(max-width:980px)').matches) {
                        e.stopPropagation();
                        sidebar?.classList.remove('open');
                        rightbar?.classList.toggle('show')
                    }
                });
                document.addEventListener('click', function(e) {
                    if (!isMobile())
                        return;
                    if (sidebar?.classList.contains('open') && !e.target.closest('#sidebar') && !e.target.closest('#mobileMenuBtn'))
                        sidebar.classList.remove('open');
                    if (rightbar?.classList.contains('show') && !e.target.closest('.rightbar') && !e.target.closest('#membersBtn'))
                        rightbar.classList.remove('show');
                });
                document.addEventListener('click', function(e) {
                    if (isMobile() && e.target.closest('[data-room],.channels .nav-item'))
                        closePanels()
                });
                window.addEventListener('resize', function() {
                    if (!window.matchMedia('(max-width:980px)').matches)
                        closePanels()
                });
            }
            )();
        </script>
        <script id="riw-calling-feature">
            (function() {
                const STUN_SERVERS = [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ];

                let activeCall = null; // { callId, video, localStream, peers:{uid:RTCPeerConnection}, camOn, participantsListenerRef }
                let knownParticipants = new Set();
                let ringingInviteId = null;
                let ringingFrom = null;

                function pairKey(a, b) {
                    return [a, b].sort().join('_');
                }

                function callTargets() {
                    if (currentRoom.type === 'dm') {
                        const other = Object.keys(dms[currentRoom.id]?.members || {}).find(u => u !== currentUser.uid);
                        return other ? [other] : [];
                    }
                    if (currentRoom.type === 'group') {
                        return Object.keys(groups[currentRoom.id]?.members || {}).filter(u => u !== currentUser.uid);
                    }
                    return [];
                }

                function updateCallButtons() {
                    const show = !!currentUser && (currentRoom.type === 'dm' || currentRoom.type === 'group') && callTargets().length > 0;
                    $('voiceCallBtn').classList.toggle('hidden', !show);
                    $('videoCallBtn').classList.toggle('hidden', !show);
                }

                // Hook into room switching so the call buttons update.
                const _origSelectRoom = selectRoom;
                window.selectRoom = function(type, id, name) {
                    _origSelectRoom(type, id, name);
                    updateCallButtons();
                };

                async function startCall(video) {
                    if (!currentUser) return openModal('authModal');
                    if (activeCall) return toast('You are already in a call.');
                    const targets = callTargets();
                    if (!targets.length) return;

                    let localStream;
                    try {
                        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
                    } catch (e) {
                        toast('Could not access ' + (video ? 'camera/microphone' : 'microphone') + '.');
                        return;
                    }

                    const callRef = db.ref('squiddChatV5/calls').push();
                    const callId = callRef.key;
                    await callRef.set({
                        initiator: currentUser.uid,
                        video,
                        roomType: currentRoom.type,
                        roomId: currentRoom.id,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    });

                    for (const uid of targets) {
                        await db.ref(`squiddChatV5/callInvites/${uid}/${callId}`).set({
                            from: currentUser.uid,
                            video,
                            roomType: currentRoom.type,
                            roomId: currentRoom.id,
                            ts: firebase.database.ServerValue.TIMESTAMP
                        });
                    }

                    beginActiveCall(callId, video, localStream, `Calling ${currentRoom.name}…`);
                }

                function showIncomingCall(callId, invite) {
                    if (activeCall || ringingInviteId) {
                        // Already busy — decline automatically.
                        db.ref(`squiddChatV5/callInvites/${currentUser.uid}/${callId}`).remove();
                        return;
                    }
                    ringingInviteId = callId;
                    ringingFrom = invite.from;
                    const u = users[invite.from] || {};
                    $('rcIncomingAvatar').src = u.avatar || DEFAULT_AVATAR;
                    $('rcIncomingName').textContent = (u.displayName || u.username || 'Someone') + ' is calling!';
                    $('rcIncomingSub').textContent = invite.video ? 'Video call' : 'Voice call';
                    $('incomingCallOverlay').classList.add('show');

                    $('rcDeclineBtn').onclick = () => {
                        db.ref(`squiddChatV5/callInvites/${currentUser.uid}/${callId}`).remove();
                        $('incomingCallOverlay').classList.remove('show');
                        ringingInviteId = null;
                        ringingFrom = null;
                    };

                    $('rcAcceptBtn').onclick = async () => {
                        let localStream;
                        try {
                            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: invite.video });
                        } catch (e) {
                            toast('Could not access ' + (invite.video ? 'camera/microphone' : 'microphone') + '.');
                            db.ref(`squiddChatV5/callInvites/${currentUser.uid}/${callId}`).remove();
                            return;
                        }
                        $('incomingCallOverlay').classList.remove('show');
                        ringingInviteId = null;
                        ringingFrom = null;
                        db.ref(`squiddChatV5/callInvites/${currentUser.uid}/${callId}`).remove();
                        beginActiveCall(callId, invite.video, localStream, null);
                    };
                }

                function beginActiveCall(callId, video, localStream, statusText) {
                    activeCall = {
                        callId,
                        video,
                        localStream,
                        peers: {},
                        camOn: video,
                        camStateRef: null,
                        participantsRef: null
                    };
                    knownParticipants = new Set();

                    $('activeCallOverlay').classList.add('show');
                    $('rcStatus').textContent = statusText || '';
                    $('rcGrid').innerHTML = '';
                    renderLocalTile();

                    const selfRef = db.ref(`squiddChatV5/calls/${callId}/participants/${currentUser.uid}`);
                    selfRef.onDisconnect().remove();
                    selfRef.set(true);

                    const participantsRef = db.ref(`squiddChatV5/calls/${callId}/participants`);
                    activeCall.participantsRef = participantsRef;
                    participantsRef.on('value', snap => {
                        const val = snap.val() || {};
                        const nowSet = new Set(Object.keys(val));
                        for (const uid of nowSet) {
                            if (uid === currentUser.uid) continue;
                            if (!knownParticipants.has(uid)) {
                                knownParticipants.add(uid);
                                connectToPeer(callId, uid);
                                $('rcStatus').textContent = '';
                            }
                        }
                        for (const uid of knownParticipants) {
                            if (!nowSet.has(uid)) {
                                knownParticipants.delete(uid);
                                disconnectPeer(uid);
                            }
                        }
                        if (nowSet.size <= 1 && !statusText) {
                            // everyone else left
                        }
                    });

                    const camStateRef = db.ref(`squiddChatV5/calls/${callId}/camState/${currentUser.uid}`);
                    activeCall.camStateRef = camStateRef;
                    camStateRef.onDisconnect().remove();
                    camStateRef.set(video);

                    db.ref(`squiddChatV5/calls/${callId}/camState`).on('value', snap => {
                        const val = snap.val() || {};
                        Object.entries(val).forEach(([uid, on]) => {
                            if (uid === currentUser.uid) return;
                            updateRemoteTileCam(uid, on !== false);
                        });
                    });

                    $('rcMuteBtn').onclick = toggleMute;
                    $('rcCamBtn').onclick = toggleCamera;
                    $('rcEndBtn').onclick = hangUp;
                    if (!video) {
                        $('rcCamBtn').style.display = 'none';
                    } else {
                        $('rcCamBtn').style.display = '';
                    }
                }

                function connectToPeer(callId, remoteUid) {
                    const isInitiator = currentUser.uid > remoteUid;
                    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
                    activeCall.peers[remoteUid] = pc;

                    activeCall.localStream.getTracks().forEach(t => pc.addTrack(t, activeCall.localStream));

                    const key = pairKey(currentUser.uid, remoteUid);
                    const signalsRef = db.ref(`squiddChatV5/calls/${callId}/signals/${key}`);

                    pc.onicecandidate = (e) => {
                        if (e.candidate) {
                            signalsRef.child(`candidates/${currentUser.uid}`).push(e.candidate.toJSON());
                        }
                    };

                    pc.ontrack = (e) => {
                        addRemoteTile(remoteUid, e.streams[0]);
                    };

                    signalsRef.child(`candidates/${remoteUid}`).on('child_added', snap => {
                        const cand = snap.val();
                        if (cand) pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                    });

                    if (isInitiator) {
                        pc.onnegotiationneeded = async () => {
                            try {
                                const offer = await pc.createOffer();
                                await pc.setLocalDescription(offer);
                                await signalsRef.child('offer').set({ sdp: pc.localDescription.sdp, type: pc.localDescription.type, from: currentUser.uid });
                            } catch (err) {
                                console.error('negotiation error', err);
                            }
                        };
                    } else {
                        signalsRef.child('offer').on('value', async snap => {
                            const offer = snap.val();
                            if (!offer || offer.from === currentUser.uid) return;
                            if (pc.signalingState !== 'stable') return;
                            await pc.setRemoteDescription(new RTCSessionDescription({ type: offer.type, sdp: offer.sdp }));
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                            await signalsRef.child('answer').set({ sdp: pc.localDescription.sdp, type: pc.localDescription.type, from: currentUser.uid });
                        });
                    }

                    if (isInitiator) {
                        signalsRef.child('answer').on('value', async snap => {
                            const answer = snap.val();
                            if (!answer || answer.from === currentUser.uid) return;
                            if (pc.currentRemoteDescription) return;
                            await pc.setRemoteDescription(new RTCSessionDescription({ type: answer.type, sdp: answer.sdp }));
                        });
                    }

                    addRemoteTilePlaceholder(remoteUid);
                }

                function disconnectPeer(uid) {
                    const pc = activeCall && activeCall.peers[uid];
                    if (pc) {
                        pc.close();
                        delete activeCall.peers[uid];
                    }
                    const tile = $('rcGrid').querySelector(`[data-uid="${cssEsc(uid)}"]`);
                    if (tile) tile.remove();
                }

                function cssEsc(s) {
                    return String(s).replace(/["\\]/g, '\\$&');
                }

                function renderLocalTile() {
                    let tile = $('rcGrid').querySelector('[data-uid="__self"]');
                    if (!tile) {
                        tile = document.createElement('div');
                        tile.className = 'rc-tile';
                        tile.dataset.uid = '__self';
                        $('rcGrid').appendChild(tile);
                    }
                    fillTile(tile, activeCall.localStream, currentUser.uid, activeCall.camOn, true);
                }

                function addRemoteTilePlaceholder(uid) {
                    let tile = $('rcGrid').querySelector(`[data-uid="${cssEsc(uid)}"]`);
                    if (!tile) {
                        tile = document.createElement('div');
                        tile.className = 'rc-tile';
                        tile.dataset.uid = uid;
                        $('rcGrid').appendChild(tile);
                        fillTile(tile, null, uid, false, false);
                    }
                }

                function addRemoteTile(uid, stream) {
                    let tile = $('rcGrid').querySelector(`[data-uid="${cssEsc(uid)}"]`);
                    if (!tile) {
                        tile = document.createElement('div');
                        tile.className = 'rc-tile';
                        tile.dataset.uid = uid;
                        $('rcGrid').appendChild(tile);
                    }
                    tile._stream = stream;
                    const camOn = tile._camOn !== false;
                    fillTile(tile, stream, uid, camOn, false);
                }

                function updateRemoteTileCam(uid, on) {
                    const tile = $('rcGrid').querySelector(`[data-uid="${cssEsc(uid)}"]`);
                    if (!tile) return;
                    tile._camOn = on;
                    fillTile(tile, tile._stream, uid, on, false);
                }

                function fillTile(tile, stream, uid, camOn, isLocal) {
                    const u = users[uid] || {};
                    tile.innerHTML = '';
                    if (camOn && stream && stream.getVideoTracks().length) {
                        const video = document.createElement('video');
                        video.autoplay = true;
                        video.playsInline = true;
                        video.muted = isLocal;
                        video.srcObject = stream;
                        tile.appendChild(video);
                    } else {
                        const img = document.createElement('img');
                        img.className = 'rc-tile-avatar';
                        img.src = u.avatar || DEFAULT_AVATAR;
                        tile.appendChild(img);
                    }
                    const label = document.createElement('div');
                    label.className = 'rc-tile-label';
                    label.textContent = (u.displayName || u.username || 'User') + (isLocal ? ' (you)' : '');
                    tile.appendChild(label);
                }

                function toggleMute() {
                    if (!activeCall) return;
                    const track = activeCall.localStream.getAudioTracks()[0];
                    if (!track) return;
                    track.enabled = !track.enabled;
                    $('rcMuteBtn').classList.toggle('off', !track.enabled);
                }

                function toggleCamera() {
                    if (!activeCall) return;
                    const track = activeCall.localStream.getVideoTracks()[0];
                    if (!track) return;
                    track.enabled = !track.enabled;
                    activeCall.camOn = track.enabled;
                    $('rcCamBtn').classList.toggle('off', !track.enabled);
                    renderLocalTile();
                    activeCall.camStateRef.set(track.enabled);
                }

                function hangUp() {
                    if (!activeCall) return;
                    const callId = activeCall.callId;
                    db.ref(`squiddChatV5/calls/${callId}/participants/${currentUser.uid}`).remove();
                    if (activeCall.participantsRef) activeCall.participantsRef.off();
                    db.ref(`squiddChatV5/calls/${callId}/camState`).off();
                    if (activeCall.camStateRef) activeCall.camStateRef.remove();
                    Object.keys(activeCall.peers).forEach(uid => {
                        activeCall.peers[uid].close();
                        db.ref(`squiddChatV5/calls/${callId}/signals/${pairKey(currentUser.uid, uid)}`).off();
                    });
                    activeCall.localStream.getTracks().forEach(t => t.stop());
                    activeCall = null;
                    knownParticipants = new Set();
                    $('activeCallOverlay').classList.remove('show');
                    $('rcGrid').innerHTML = '';
                }

                $('voiceCallBtn').addEventListener('click', () => startCall(false));
                $('videoCallBtn').addEventListener('click', () => startCall(true));

                authPersistenceReady.finally(() => {
                    auth.onAuthStateChanged(u => {
                        if (!u) return;
                        db.ref(`squiddChatV5/callInvites/${u.uid}`).on('child_added', snap => {
                            const invite = snap.val();
                            if (!invite) return;
                            // Ignore stale invites from before this session started listening for very old timestamps is not tracked; acceptable for a friends-only calling feature.
                            showIncomingCall(snap.key, invite);
                        });
                        db.ref(`squiddChatV5/callInvites/${u.uid}`).on('child_removed', snap => {
                            if (ringingInviteId === snap.key) {
                                $('incomingCallOverlay').classList.remove('show');
                                ringingInviteId = null;
                                ringingFrom = null;
                                toast('Call cancelled.');
                            }
                        });
                    });
                });

                updateCallButtons();
            })();
        </script>
    </body>
</html>
