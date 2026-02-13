import { useEffect } from 'react';

export default function Popup() {
  useEffect(() => {
    chrome.tabs.create({ url: 'newtab.html' });
    window.close();
  }, []);

  return (
    <div className="popup">
      <h2>正在打开面板...</h2>
    </div>
  );
}
