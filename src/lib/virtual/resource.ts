import URI from "vscode-uri";
import { Host } from "./host";

export class Resource {
  public static from(source: Host, uri: URI): Resource {
    return new this(source, uri);
  }
  protected constructor(readonly source: Host, readonly uri: URI) { }
  public into(target: Host, skipEncoding: boolean = true): URI {
    switch (target) {
      case Host.Native:
        return this.readNative(skipEncoding);
      case Host.WSL:
        return this.readWSL(skipEncoding);
    }
  }
  protected readNative(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        return this.uri;
      case Host.WSL:
        // FIXME: move this check somewhere earlier and do it only once
        const localappdata = process.env.localappdata;
        if (null == localappdata) throw new Error("LOCALAPPDATA must be set in environment to interpret WSL /home");

        let uri = this.uri;
        let searcher: RegExp;
        let replacer: (match: string, capture: string) => string;

        // rewrite /mnt/…
        searcher = /^file:\/\/\/mnt\/([a-zA-Z])\//;
        replacer = (_, drive) => `file:///${drive}:/`;
        uri = URI.parse(uri.toString(skipEncoding).replace(searcher, replacer));

        // rewrite /home/…
        searcher = /^file:\/\/\/home\/(.+)$/;
        replacer = (_, rest) => `${URI.file(localappdata).toString(skipEncoding)}/lxss/home/${rest}`;
        uri = URI.parse(uri.toString(skipEncoding).replace(searcher, replacer));

        return uri;
    }
  }
  protected readWSL(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        const searcher = /^file:\/\/\/([a-zA-Z]):\//;
        const replacer = (_: string, drive: string) => `file:///mnt/${drive}/`;
        return URI.parse(this.uri.toString(skipEncoding).replace(searcher, replacer));
      case Host.WSL:
        return this.uri;
    }
  }
}
