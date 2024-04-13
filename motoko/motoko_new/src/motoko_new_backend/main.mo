import Text "mo:base/Text";
import List "mo:base/List";
import Option "mo:base/Option";

actor {
  var list : List.List<Text> = List.nil<Text>();

  public func greet(name : Text) : async Text {
    let exists = List.find(list, func (x : Text) : Bool { x == name });

    switch (exists) {
      case null {
        list := List.push(name, list);
      };
      case (?_) { /* value exists, do nothing */ };
    };

    return "Hello, " # name # "!";
  };

  public query func listNames() : async List.List<Text> {
    return list;
  };
};
