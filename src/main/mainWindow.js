import BrowserWinHandler from "./BrowserWinHandler";

const winHandler = new BrowserWinHandler({
  height: 600,
  width: 1000,
});

winHandler.onCreated((_browserWindow) => {
  winHandler.loadPage("/");

  if (process.env.NODE_ENV != "development") _browserWindow.removeMenu();
  // Or load custom url
  // _browserWindow.loadURL('https://google.com')
});

export default winHandler;
