export async function _setTimeout(cb: () => Promise<any>): Promise<any> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(cb());
    }, 500)
  );
}
