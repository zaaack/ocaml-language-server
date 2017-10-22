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
        let match: RegExpMatchArray | null = null;
        // rewrite /mnt/…
        searcher = /^file:\/\/\/mnt\/([a-zA-Z])\/(.*)$/;
        if (match = uri.toString(skipEncoding).match(searcher)) {
          match.shift();
          const drive = match.shift() as string;
          const  rest = match.shift() as string;
          uri = URI.parse(`file:///${drive}:/${rest}`);
        }
        // rewrite /home/…
        searcher = /^file:\/\/\/home\/(.+)$/;
        if (match = uri.toString(skipEncoding).match(searcher)) {
          match.shift();
          const rest = match.shift() as string;
          uri = URI.parse(`${URI.file(localappdata).toString(skipEncoding)}/lxss/home/${rest}`);
        }
        return uri;
    }
  }
  protected readWSL(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        let uri = this.uri;
        let searcher: RegExp;
        let match: RegExpMatchArray | null = null;
        searcher = /^file:\/\/\/([a-zA-Z]):\//;
        if (match = uri.toString(skipEncoding).match(searcher)) {
          match.shift();
          const drive = match.shift() as string;
          uri = URI.parse(`file:///mnt/${drive}/`);
        }
        return uri;
      case Host.WSL:
        return this.uri;
    }
  }
}
