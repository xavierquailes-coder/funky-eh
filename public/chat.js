/* Berri Chat bridge
   berri://chat uses the exact working chat from:
   https://berrios-lumin-games-integrated.vercel.app/chat.html

   No chat.html file is required in this project.
*/
(function () {
  const LIVE_CHAT_URL =
    'https://berrios-lumin-games-integrated.vercel.app/chat.html';

  let chatHtmlPromise = null;

  function addBaseUrl(html) {
    const base =
      `<base href="https://berrios-lumin-games-integrated.vercel.app/">`;

    if (/<head[^>]*>/i.test(html)) {
      return html.replace(
        /<head([^>]*)>/i,
        `<head$1>${base}`
      );
    }

    return `
      <!doctype html>
      <html>
        <head>${base}</head>
        <body>${html}</body>
      </html>
    `;
  }

  function getLiveChatHtml() {
    if (!chatHtmlPromise) {
      chatHtmlPromise = fetch(
        LIVE_CHAT_URL,
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        }
      )
        .then(async response => {
          if (!response.ok) {
            throw new Error(
              `Chat source returned ${response.status}`
            );
          }

          const html =
            await response.text();

          return addBaseUrl(html);
        })
        .catch(error => {
          chatHtmlPromise = null;
          throw error;
        });
    }

    return chatHtmlPromise;
  }

  function goHome() {
    if (
      typeof window.berriNavigateInternal ===
      'function'
    ) {
      window.berriNavigateInternal(
        'berri://home'
      );
    }
  }

  window.addEventListener(
    'message',
    event => {
      if (
        event?.data?.type ===
        'sq-close-chat'
      ) {
        goHome();
      }
    }
  );

  window.buildBerriChatPage =
    function buildBerriChatPage(tab) {
      if (tab.__berriChatView) {
        return tab.__berriChatView;
      }

      const host =
        document.createElement(
          'div'
        );

      host.className =
        'bb-chat-route';

      host.style.width =
        '100%';

      host.style.height =
        '100%';

      host.style.minHeight =
        '0';

      host.style.position =
        'relative';

      host.style.overflow =
        'hidden';

      host.style.background =
        '#000';

      const frame =
        document.createElement(
          'iframe'
        );

      frame.className =
        'bb-chat-live-frame';

      frame.title =
        'Berri Chat';

      frame.setAttribute(
        'allow',
        'clipboard-read; clipboard-write; microphone; camera; autoplay; fullscreen'
      );

      frame.style.width =
        '100%';

      frame.style.height =
        '100%';

      frame.style.minHeight =
        '0';

      frame.style.display =
        'block';

      frame.style.border =
        '0';

      frame.style.background =
        '#000';

      const loading =
        document.createElement(
          'div'
        );

      loading.textContent =
        'Loading Chat…';

      loading.style.position =
        'absolute';

      loading.style.inset =
        '0';

      loading.style.display =
        'grid';

      loading.style.placeItems =
        'center';

      loading.style.background =
        '#000';

      loading.style.color =
        '#fff';

      loading.style.font =
        '600 14px Inter, system-ui, sans-serif';

      loading.style.zIndex =
        '2';

      host.appendChild(frame);
      host.appendChild(loading);

      frame.addEventListener(
        'load',
        () => {
          loading.remove();
        },
        { once: true }
      );

      getLiveChatHtml()
        .then(html => {
          /*
            This loads the exact working
            chat document inside berri://chat.

            It does NOT navigate Berri
            itself to chat.html.
          */
          frame.srcdoc = html;
        })
        .catch(error => {
          console.error(
            'Could not copy the live RIW/Berri Chat into berri://chat:',
            error
          );

          /*
            Fallback:
            if fetching the HTML gets
            blocked for some reason,
            load that exact working chat
            directly inside this iframe.
          */
          frame.src =
            LIVE_CHAT_URL;
        });

      tab.__berriChatView =
        host;

      return host;
    };
})();
