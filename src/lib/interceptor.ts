export type XHRCallback = (xhr: XMLHttpRequest) => void;

export type FetchCallback = (
  response: Response
) => Response | Promise<Response | void> | void;

export type FetchArgsFilter = (
  args: [input: RequestInfo | URL, init?: RequestInit]
) => [input: RequestInfo | URL, init?: RequestInit];

/**
 * Intercept XMLHttpRequest responses. Only fires on successful (status 200) completed requests.
 * Returns an uninstall function to restore the original behavior.
 */
export function installXHR(callback: XHRCallback): () => void {
  const original = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function (
    this: XMLHttpRequest,
    ...args: [body?: Document | XMLHttpRequestBodyInit | null]
  ) {
    this.addEventListener("load", () => {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        try {
          callback(this);
        } catch (e) {
          console.error("[FastDL] XHR intercept error:", e);
        }
      }
    });
    return original.apply(this, args);
  };

  return () => {
    XMLHttpRequest.prototype.send = original;
  };
}

/**
 * Intercept fetch responses. The callback receives a cloned response so
 * the original remains consumable. If the callback returns a Response,
 * it replaces the one delivered to the caller (useful for filtering).
 * Returns an uninstall function to restore the original behavior.
 */
export function installFetch(
  callback: FetchCallback,
  argsFilters?: FetchArgsFilter[]
): () => void {
  const original = window.fetch;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    let args: [RequestInfo | URL, RequestInit?] = [input, init];
    if (argsFilters) {
      for (const filter of argsFilters) {
        args = filter(args);
      }
    }

    const response = await original.apply(this, args);

    try {
      const cloned = response.clone();
      const result = await callback(cloned);
      if (result instanceof Response) return result;
    } catch (e) {
      console.error("[FastDL] Fetch intercept error:", e);
    }

    return response;
  };

  return () => {
    window.fetch = original;
  };
}
