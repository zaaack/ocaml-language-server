let module Position = {
  type t = (int, int) [@@deriving (eq, ord, show)];
};

let module Range = {
  type t = (Position.t, Position.t) [@@deriving (eq, ord, show)];
};
