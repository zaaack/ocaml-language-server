type value = [
  | Jsonm.lexeme
  | `A (list value)
  | `O (list (string, value))
  ] [@@deriving (show)];

type completed = [
  | `A (list value)
  | `O (list (string, value))
  ] [@@deriving (show)];

type result =
  | Error Error.t
  | Value value
[@@deriving (show)];

type exn +=
  | Error of Error.t;

type return 'r = Jsonm.decoder => 'r;
type cont 'r = (value => return 'r) => return 'r;

let decode dec =>
  switch (Jsonm.decode dec) {
  | `Await => assert false
  | `End => assert false
  | `Lexeme lex => lex
  | `Error err =>
    let kind = err;
    let range = Jsonm.decoded_range dec;
    raise @@ Error { Error.kind, range };
  };

let rec (from: Jsonm.lexeme => cont 'r) = fun lex ret dec => {
  let stack = [];
  switch lex {
  | `Os => obj stack ret dec
  | `As => arr stack ret dec
  | (`Null | `Bool _ | `String _ | `Float _) as v => ret v dec
  | _ => assert false
  }
}

  and arr: list value => cont 'r = fun rest ret dec =>
    switch (decode dec) {
    | `Ae => ret (`A (List.rev rest)) dec
    | value => from value (fun value => arr [value, ...rest] ret) dec
    }

  and obj: list (string, value) => cont 'r = fun rest ret dec =>
    switch (decode dec) {
    | `Oe => ret (`O (List.rev rest)) dec
    | `Name name => from (decode dec) (fun value => obj [(name, value), ...rest] ret) dec
    | _ => assert false
    };

  let parse encoding::encoding=? src => {
    let return json _dec => json;
    let decoder = Jsonm.decoder encoding::?encoding src;
    try (Value (from (decode decoder) return decoder)) {
    | Error err => Error err
    }
 };
