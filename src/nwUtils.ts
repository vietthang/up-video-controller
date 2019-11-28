export function openWindow(
  url: string,
  options?: NWJS_Helpers.WindowOpenOption,
): Promise<NWJS_Helpers.win> {
  return new Promise((resolve, reject) => {
    window.nw.Window.open(url, options, win => {
      if (!win) {
        return reject(new Error('failed to open new window'))
      }
      return resolve(win)
    })
  })
}
