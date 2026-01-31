const timelineSelector = "[aria-label='Timeline: Conversation']";
const tweetsSelector = '[data-testid="tweet"]';
const usernameSelector = '[data-testid="User-Name"]';
const botSelector = "[aria-label='Verified account']";

let pageTitle = '';
let observer: MutationObserver | null = null;

function trackPageChange() {
  const titleObserver = new MutationObserver(() => {
    if (document.title !== 'X' && pageTitle !== document.title) {
      pageTitle = document.title;
      if (document.URL.includes('/status/')) hideTweets();
    }
  });

  titleObserver.observe(document.head || document.documentElement, {
    childList: true,
    subtree: true
  });
}

function waitForEl(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((_) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

async function hideTweets() {
  observer?.disconnect();

  const conversation = await waitForEl(timelineSelector);

  observer = new MutationObserver(() => {
    const currentAuthor = document.URL.split('/')[3];
    const tweets = (conversation?.querySelectorAll(tweetsSelector) ||
      []) as HTMLElement[];

    for (const tweet of tweets) {
      if (tweet.style.display === 'none') continue;

      const username = tweet.querySelector(usernameSelector);
      if (!username) continue;

      if (
        username.textContent.includes(currentAuthor) ||
        username.textContent.includes('@grok')
      )
        continue;

      if (username.querySelector(botSelector)) {
        tweet.style.display = 'none';
      }
    }
  });

  observer.observe(conversation as Node, { childList: true, subtree: true });
}

trackPageChange();
