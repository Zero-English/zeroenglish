import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Migrating...",
  robots: { index: false, follow: false },
};

export default function MigratePage() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  var ORIGIN = "https://zeroenglish.tahmidhasan.net";

  function sendToParent(data) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "INDEXEDDB_MIGRATE", data: data }, ORIGIN);
    }
  }

  function readLocalStorage(prefix) {
    var entries = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          var raw = localStorage.getItem(key);
          if (raw) entries.push(JSON.parse(raw));
        } catch(e) {}
      }
    }
    return entries;
  }

  async function exportData() {
    try {
      var req = indexedDB.open("VocabularyDB");
      req.onsuccess = function() {
        var db = req.result;
        var tx = db.transaction(["words", "activity"], "readonly");
        var wordsStore = tx.objectStore("words");
        var activityStore = tx.objectStore("activity");
        var wordsReq = wordsStore.getAll();
        var activityReq = activityStore.getAll();

        wordsReq.onsuccess = function() {
          activityReq.onsuccess = function() {
            sendToParent({ words: wordsReq.result || [], activity: activityReq.result || [] });
            db.close();
          };
          activityReq.onerror = function() {
            sendToParent({ words: wordsReq.result || [], activity: [] });
            db.close();
          };
        };
        wordsReq.onerror = function() {
          sendToParent({ words: [], activity: [] });
          db.close();
        };
      };
      req.onerror = function() {
        sendToParent({ words: readLocalStorage("voc_"), activity: [] });
      };
    } catch(e) {
      sendToParent({ words: [], activity: [] });
    }
  }

  if (document.readyState === "complete") {
    exportData();
  } else {
    window.addEventListener("load", exportData);
    if (document.readyState === "interactive") exportData();
  }
})();
`,
      }}
    />
  );
}
