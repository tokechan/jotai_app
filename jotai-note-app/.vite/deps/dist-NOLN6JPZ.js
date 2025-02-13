import {
  defineCSSCompletionSource
} from "./chunk-C4MAMX6I.js";
import {
  ContextTracker,
  ExternalTokenizer,
  LRLanguage,
  LRParser,
  LanguageSupport,
  continuedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  styleTags,
  tags
} from "./chunk-NSPZCAGU.js";
import "./chunk-DWA4UIM3.js";

// node_modules/@lezer/sass/dist/index.js
var indent = 154;
var dedent = 155;
var descendantOp = 156;
var InterpolationEnd = 1;
var InterpolationContinue = 2;
var Unit = 3;
var callee = 157;
var identifier = 158;
var VariableName = 4;
var InterpolationStart = 5;
var newline = 159;
var blankLineStart = 160;
var eof = 161;
var whitespace = 162;
var LineComment = 6;
var Comment = 7;
var IndentedMixin = 8;
var IndentedInclude = 9;
var Dialect_indented = 0;
var space = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var colon = 58;
var parenL = 40;
var underscore = 95;
var bracketL = 91;
var dash = 45;
var period = 46;
var hash = 35;
var percent = 37;
var braceL = 123;
var braceR = 125;
var slash = 47;
var asterisk = 42;
var newlineChar = 10;
var equals = 61;
var plus = 43;
var and = 38;
function isAlpha(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
function startOfComment(input) {
  let next;
  return input.next == slash && ((next = input.peek(1)) == slash || next == asterisk);
}
var spaces = new ExternalTokenizer((input, stack) => {
  if (stack.dialectEnabled(Dialect_indented)) {
    let prev;
    if (input.next < 0 && stack.canShift(eof)) {
      input.acceptToken(eof);
    } else if (((prev = input.peek(-1)) == newlineChar || prev < 0) && stack.canShift(blankLineStart)) {
      let spaces2 = 0;
      while (input.next != newlineChar && space.includes(input.next)) {
        input.advance();
        spaces2++;
      }
      if (input.next == newlineChar || startOfComment(input))
        input.acceptToken(blankLineStart, -spaces2);
      else if (spaces2)
        input.acceptToken(whitespace);
    } else if (input.next == newlineChar) {
      input.acceptToken(newline, 1);
    } else if (space.includes(input.next)) {
      input.advance();
      while (input.next != newlineChar && space.includes(input.next)) input.advance();
      input.acceptToken(whitespace);
    }
  } else {
    let length = 0;
    while (space.includes(input.next)) {
      input.advance();
      length++;
    }
    if (length) input.acceptToken(whitespace);
  }
}, { contextual: true });
var comments = new ExternalTokenizer((input, stack) => {
  if (!startOfComment(input)) return;
  input.advance();
  if (stack.dialectEnabled(Dialect_indented)) {
    let indentedComment = -1;
    for (let off = 1; ; off++) {
      let prev = input.peek(-off - 1);
      if (prev == newlineChar || prev < 0) {
        indentedComment = off + 1;
        break;
      } else if (!space.includes(prev)) {
        break;
      }
    }
    if (indentedComment > -1) {
      let block = input.next == asterisk, end = 0;
      input.advance();
      while (input.next >= 0) {
        if (input.next == newlineChar) {
          input.advance();
          let indented = 0;
          while (input.next != newlineChar && space.includes(input.next)) {
            indented++;
            input.advance();
          }
          if (indented < indentedComment) {
            end = -indented - 1;
            break;
          }
        } else if (block && input.next == asterisk && input.peek(1) == slash) {
          end = 2;
          break;
        } else {
          input.advance();
        }
      }
      input.acceptToken(block ? Comment : LineComment, end);
      return;
    }
  }
  if (input.next == slash) {
    while (input.next != newlineChar && input.next >= 0) input.advance();
    input.acceptToken(LineComment);
  } else {
    input.advance();
    while (input.next >= 0) {
      let { next } = input;
      input.advance();
      if (next == asterisk && input.next == slash) {
        input.advance();
        break;
      }
    }
    input.acceptToken(Comment);
  }
});
var indentedMixins = new ExternalTokenizer((input, stack) => {
  if ((input.next == plus || input.next == equals) && stack.dialectEnabled(Dialect_indented))
    input.acceptToken(input.next == equals ? IndentedMixin : IndentedInclude, 1);
});
var indentation = new ExternalTokenizer((input, stack) => {
  if (!stack.dialectEnabled(Dialect_indented)) return;
  let cDepth = stack.context.depth;
  if (input.next < 0 && cDepth) {
    input.acceptToken(dedent);
    return;
  }
  let prev = input.peek(-1);
  if (prev == newlineChar) {
    let depth = 0;
    while (input.next != newlineChar && space.includes(input.next)) {
      input.advance();
      depth++;
    }
    if (depth != cDepth && input.next != newlineChar && !startOfComment(input)) {
      if (depth < cDepth) input.acceptToken(dedent, -depth);
      else input.acceptToken(indent);
    }
  }
});
var identifiers = new ExternalTokenizer((input, stack) => {
  for (let inside = false, dashes = 0, i = 0; ; i++) {
    let { next } = input;
    if (isAlpha(next) || next == dash || next == underscore || inside && isDigit(next)) {
      if (!inside && (next != dash || i > 0)) inside = true;
      if (dashes === i && next == dash) dashes++;
      input.advance();
    } else if (next == hash && input.peek(1) == braceL) {
      input.acceptToken(InterpolationStart, 2);
      break;
    } else {
      if (inside)
        input.acceptToken(next == parenL ? callee : dashes == 2 && stack.canShift(VariableName) ? VariableName : identifier);
      break;
    }
  }
});
var interpolationEnd = new ExternalTokenizer((input) => {
  if (input.next == braceR) {
    input.advance();
    while (isAlpha(input.next) || input.next == dash || input.next == underscore || isDigit(input.next))
      input.advance();
    if (input.next == hash && input.peek(1) == braceL)
      input.acceptToken(InterpolationContinue, 2);
    else
      input.acceptToken(InterpolationEnd);
  }
});
var descendant = new ExternalTokenizer((input) => {
  if (space.includes(input.peek(-1))) {
    let { next } = input;
    if (isAlpha(next) || next == underscore || next == hash || next == period || next == bracketL || next == colon || next == dash || next == and)
      input.acceptToken(descendantOp);
  }
});
var unitToken = new ExternalTokenizer((input) => {
  if (!space.includes(input.peek(-1))) {
    let { next } = input;
    if (next == percent) {
      input.advance();
      input.acceptToken(Unit);
    }
    if (isAlpha(next)) {
      do {
        input.advance();
      } while (isAlpha(input.next));
      input.acceptToken(Unit);
    }
  }
});
function IndentLevel(parent, depth) {
  this.parent = parent;
  this.depth = depth;
  this.hash = (parent ? parent.hash + parent.hash << 8 : 0) + depth + (depth << 4);
}
var topIndent = new IndentLevel(null, 0);
var trackIndent = new ContextTracker({
  start: topIndent,
  shift(context, term, stack, input) {
    if (term == indent) return new IndentLevel(context, stack.pos - input.pos);
    if (term == dedent) return context.parent;
    return context;
  },
  hash(context) {
    return context.hash;
  }
});
var cssHighlighting = styleTags({
  "AtKeyword import charset namespace keyframes media supports include mixin use forward extend at-root": tags.definitionKeyword,
  "Keyword selector": tags.keyword,
  "ControlKeyword": tags.controlKeyword,
  NamespaceName: tags.namespace,
  KeyframeName: tags.labelName,
  TagName: tags.tagName,
  "ClassName Suffix": tags.className,
  PseudoClassName: tags.constant(tags.className),
  IdName: tags.labelName,
  "FeatureName PropertyName": tags.propertyName,
  AttributeName: tags.attributeName,
  NumberLiteral: tags.number,
  KeywordQuery: tags.keyword,
  UnaryQueryOp: tags.operatorKeyword,
  "CallTag ValueName": tags.atom,
  VariableName: tags.variableName,
  SassVariableName: tags.special(tags.variableName),
  Callee: tags.operatorKeyword,
  Unit: tags.unit,
  "UniversalSelector NestingSelector IndentedMixin IndentedInclude": tags.definitionOperator,
  MatchOp: tags.compareOperator,
  "ChildOp SiblingOp, LogicOp": tags.logicOperator,
  BinOp: tags.arithmeticOperator,
  "Important Global Default": tags.modifier,
  Comment: tags.blockComment,
  LineComment: tags.lineComment,
  ColorLiteral: tags.color,
  "ParenthesizedContent StringLiteral": tags.string,
  "InterpolationStart InterpolationContinue InterpolationEnd": tags.meta,
  ': "..."': tags.punctuation,
  "PseudoOp #": tags.derefOperator,
  "; ,": tags.separator,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace
});
var spec_identifier = { __proto__: null, not: 62, only: 62, using: 179, as: 189, with: 193, without: 193, hide: 207, show: 207, from: 230, to: 232, if: 245, through: 251, in: 257 };
var spec_callee = { __proto__: null, url: 80, "url-prefix": 80, domain: 80, regexp: 80, lang: 94, "nth-child": 94, "nth-last-child": 94, "nth-of-type": 94, "nth-last-of-type": 94, dir: 94, "host-context": 94, selector: 172 };
var spec_AtKeyword = { __proto__: null, "@import": 156, "@include": 176, "@mixin": 182, "@function": 182, "@use": 186, "@extend": 196, "@at-root": 200, "@forward": 204, "@media": 210, "@charset": 214, "@namespace": 218, "@keyframes": 224, "@supports": 236, "@if": 240, "@else": 242, "@for": 248, "@each": 254, "@while": 260, "@debug": 264, "@warn": 264, "@error": 264, "@return": 264 };
var parser = LRParser.deserialize({
  version: 14,
  states: "L|Q`Q+tOOO#fQ+tOOP#mOpOOOOQ#U'#Ch'#ChO#rQ(pO'#CjOOQ#U'#Ci'#CiO%_Q)QO'#FxO%rQ.jO'#CnO&jQ#dO'#DWO'aQ(pO'#CgO'hQ)OO'#DYO'sQ#dO'#DaO'xQ#dO'#DeO'}Q#dO'#DnOOQ#U'#Fx'#FxO(SQ(pO'#FxO(ZQ(nO'#DrO%rQ.jO'#DzO%rQ.jO'#EVO%rQ.jO'#EYO%rQ.jO'#E[O(`Q)OO'#EaO)QQ)OO'#EcO%rQ.jO'#EeO)_Q)OO'#EhO%rQ.jO'#EjO)yQ)OO'#ElO*UQ#dO'#EoO*ZQ)OO'#EuO*oQ)OO'#FVOOQ&Z'#Fw'#FwOOQ&Y'#FY'#FYO*yQ(nO'#FYQ`Q+tOOO%rQ.jO'#EwO+UQ(nO'#E{O+ZQ)OO'#FOO%rQ.jO'#FRO%rQ.jO'#FTOOQ&Z'#Fa'#FaO+cQ+uO'#GRO+pQ(oO'#GRQOQ#SOOP,RO#SO'#FvPOOO)CAk)CAkOOQ#U'#Cm'#CmOOQ#U,59W,59WOOQ#i'#Cp'#CpO%rQ.jO'#CsO,aQ.wO'#CuO.|Q.^O,59YO%rQ.jO'#CzOOQ#S'#DO'#DOO/_Q(nO'#DTOOQ#i'#Fz'#FzO/dQ(nO'#C}OOQ#U'#DX'#DXOOQ#U,59r,59rO&jQ#dO,59rO/iQ)OO,59tO'sQ#dO,59{O'xQ#dO,5:PO(`Q)OO,5:TO(`Q)OO,5:VO(`Q)OO,5:WO(`Q)OO'#F`O/tQ(nO,59RO0PQ+tO'#DpO0WQ#TO'#DpOOQ&Z,59R,59ROOQ#U'#D['#D[OOQ#S'#D_'#D_OOQ#U,59t,59tO0]Q(nO,59tO0bQ(nO,59tOOQ#U'#Dc'#DcOOQ#U,59{,59{OOQ#S'#Dg'#DgO0gQ9`O,5:POOQ#U'#Do'#DoOOQ#U,5:Y,5:YO1gQ.jO,5:^O1qQ.jO,5:fO2jQ.jO,5:qO2wQ.YO,5:tO3YQ.jO,5:vOOQ#U'#Cj'#CjO4RQ(pO,5:{O4`Q(pO,5:}OOQ&Z,5:},5:}O4gQ)OO,5:}O4lQ.jO,5;POOQ#S'#D}'#D}O5[Q)OO'#ESO5cQ(nO'#GTO*ZQ)OO'#ERO5wQ(nO'#ETOOQ#S'#GU'#GUO/wQ(nO,5;SO3`Q.YO,5;UOOQ#d'#En'#EnO*yQ(nO,5;WO5|Q)OO,5;WOOQ#S'#Eq'#EqO6UQ(nO,5;ZO6ZQ(nO,5;aO6fQ(nO,5;qOOQ&Z'#GV'#GVOOQ&Y,5;t,5;tOOQ&Y-E9W-E9WO2wQ.YO,5;cO6tQ)OO,5;gO6yQ)OO'#GXO7RQ)OO,5;jO2wQ.YO,5;mO3`Q.YO,5;oOOQ&Z-E9_-E9_O7WQ(oO,5<mOOQ&Z'#GS'#GSO7iQ+uO'#FdO7WQ(oO,5<mPOO#S'#FX'#FXP7|O#SO,5<bPOOO,5<b,5<bO8[Q.YO,59_OOQ#i,59a,59aO%rQ.jO,59cO%rQ.jO,59hO%rQ.jO'#F]O8jQ#WO1G.tOOQ#k1G.t1G.tO8rQ.oO,59fO;[Q! lO,59oO<XQ.jO'#DPOOQ#i,59i,59iOOQ#U1G/^1G/^OOQ#U1G/`1G/`O0]Q(nO1G/`O0bQ(nO1G/`OOQ#U1G/g1G/gO<cQ9`O1G/kO<|Q(pO1G/oO=pQ(pO1G/qO>dQ(pO1G/rO?WQ(pO,5;zOOQ#S-E9^-E9^OOQ&Z1G.m1G.mO?eQ(nO,5:[O?jQ+uO,5:[O?qQ)OO'#D`O?xQ.jO'#D^OOQ#U1G/k1G/kO%rQ.jO1G/kO@tQ.jO'#DtOAOQ.kO1G/xOOQ#T1G/x1G/xO*yQ(nO1G0QOA{Q+uO'#GVOOQ&Z1G0]1G0]O/dQ(nO1G0]OOQ&Z1G0`1G0`OOQ&Z1G0b1G0bO/dQ(nO1G0bODeQ)OO1G0bOOQ&Z1G0g1G0gOOQ&Z1G0i1G0iODmQ)OO1G0iODrQ(nO1G0iODwQ)OO1G0kOOQ&Z1G0k1G0kOEVQ.jO'#FfOEgQ#dO1G0kOElQ(nO'#D}OEwQ(nO,5:jOE|Q(nO,5:nO*ZQ)OO,5:lOFUQ)OO'#FeOFiQ(nO,5<oOFzQ(nO,5:mO(`Q)OO,5:oOOQ&Z1G0n1G0nOOQ&Z1G0p1G0pOOQ&Z1G0r1G0rO*yQ(nO1G0rOGcQ)OO'#ErOOQ&Z1G0u1G0uOOQ&Z1G0{1G0{OOQ&Z1G1]1G1]OGqQ+uO1G0}O%rQ.jO1G1ROJZQ)OO'#FjOJfQ)OO,5<sO%rQ.jO1G1UOOQ&Z1G1X1G1XOOQ&Z1G1Z1G1ZOJnQ(oO1G2XOKPQ+uO,5<OOOQ#T,5<O,5<OOOQ#T-E9b-E9bPOO#S-E9V-E9VPOOO1G1|1G1|OOQ#i1G.y1G.yOKdQ.oO1G.}OOQ#i1G/S1G/SOM|Q.^O,5;wOOQ#W-E9Z-E9ZOOQ#k7+$`7+$`ON_Q(nO1G/ZONdQ.jO'#FZO! nQ.jO'#F}O!#VQ.jO'#FzO!#^Q(nO,59kOOQ#U7+$z7+$zOOQ#U7+%V7+%VO%rQ.jO7+%VOOQ&Z1G/v1G/vO!#cQ#TO1G/vO!#hQ(pO'#GPO!#rQ(nO,59zO!#wQ.jO'#GOO!$RQ(nO,59xO!$WQ.YO7+%VO!$fQ.YO'#FzO!$wQ(nO,5:`OOQ#T,5:`,5:`O!%PQ.kO'#FcO%rQ.jO'#FcO!&pQ.kO7+%dOOQ#T7+%d7+%dOOQ&Z7+%l7+%lO6fQ(nO7+%wO*yQ(nO7+%|OOQ#d'#E_'#E_O!'dQ)OO7+%|O!'rQ(nO7+&TO*ZQ)OO7+&TOOQ#d-E9d-E9dOOQ&Z7+&V7+&VO!'wQ.jO'#GWOOQ#d,5<Q,5<QODhQ(nO7+&VO%rQ.jO1G0UOOQ#S1G0Y1G0YOOQ#S1G0W1G0WO!(cQ(nO,5<POOQ#S-E9c-E9cO!(wQ(pO1G0ZOOQ&Z7+&^7+&^O!)OQ(vO'#CuO/wQ(nO'#FhO!)ZQ)OO,5;^OOQ&Z,5;^,5;^O!)iQ+uO7+&iO!,RQ)OO7+&iO!,^Q.jO7+&mOOQ#d,5<U,5<UOOQ#d-E9h-E9hO2wQ.YO7+&pOOQ#T1G1j1G1jOOQ#i7+$u7+$uOOQ#d-E9X-E9XO!,oQ.jO'#F[O!,|Q(nO,5<iO!,|Q(nO,5<iO%rQ.jO,5<iOOQ#i1G/V1G/VO!-UQ.YO<<HqOOQ&Z7+%b7+%bO!-dQ)OO'#F_O!-nQ(nO,5<kOOQ#U1G/f1G/fO!-vQ.jO'#F^O!.QQ(nO,5<jOOQ#U1G/d1G/dOOQ#U<<Hq<<HqO0oQ.jO,5;|O!.YQ(nO'#FbOOQ#S-E9`-E9`OOQ#T1G/z1G/zO!._Q.kO,5;}OOQ#e-E9a-E9aOOQ#T<<IO<<IOOOQ&Z<<Ic<<IcOOQ&Z<<Ih<<IhO/dQ(nO<<IhO*ZQ)OO<<IoO!0OQ(nO<<IoO!0WQ.jO'#FgO!0kQ)OO,5<rODwQ)OO<<IqO!0|Q.jO7+%pOOQ#S7+%u7+%uOOQ#d,5<S,5<SOOQ#d-E9f-E9fOOQ&Z1G0x1G0xOOQ&Z-E9g-E9gO!,RQ)OO<<JTO%rQ.jO,5<TOOQ&Z<<JT<<JTO%rQ.jO<<JXOOQ&Z<<J[<<J[O!1TQ.jO,5;vO!1bQ.jO,5;vOOQ#S-E9Y-E9YO!1iQ(nO1G2TO!1qQ.jO1G2TOOQ#UAN>]AN>]O!1{Q(pO,5;yOOQ#S-E9]-E9]O!2VQ.jO,5;xOOQ#S-E9[-E9[O!2aQ.YO1G1hO!2uQ(nO1G1hO*yQ(nOAN?SO!3QQ(nOAN?ZO/wQ(nOAN?ZO!3YQ.jO,5<ROOQ#d-E9e-E9eODwQ)OOAN?]OOQ&ZAN?]AN?]OOQ#S<<I[<<I[P!3tQ)OO'#FiOOQ&ZAN?oAN?oO2wQ.YO1G1oO2wQ.YOAN?sOOQ#S1G1b1G1bO%rQ.jO1G1bO!3yQ(nO7+'oOOQ#S7+'S7+'SOOQ&ZG24nG24nO/wQ(nOG24uOOQ&ZG24uG24uOOQ&ZG24wG24wOOQ&Z7+'Z7+'ZOOQ&ZG25_G25_O!4RQ.jO7+&|OOQ&ZLD*aLD*a",
  stateData: "!4c~O$hOSVOSUOS$fQQ~OS`OTVOWcOXbO_UOc`OtYO}YO!UZO!Y[O!omO!paO!zbO!}cO#PdO#UeO#WfO#YgO#]hO#_iO#ajO#dkO#jlO#lrO#psO#stO#vuO#xvO$dSO$mRO$pWO$t]O~O$_$uP~P`O$f{O~Ot^Xt!gXv^X}^X!U^X!Y^X!^^X!a^X!e^X$b^X$e^X$p^X~Ot$lXv$lX}$lX!U$lX!Y$lX!^$lX!a$lX!e$lX$b$lX$e$lX$p$lX~O$d}O!l$lX$g$lXf$lXe$lX~P$jOS!WOTVO_!WOc!WOf!QOh!WOj!WOo!TOx!VO$c!UO$d!PO$o!RO~O$d!YO~Ot!]O}!]O!U!^O!Y!_O!^!`O!a!bO!e!eO$b!aO$e!fO$p![O~Ov!cO~P&oO!P!lO$c!iO$d!hO~O$d!mO~O$d!oO~O$d!qO~Ot!sO~P$jOt!sO~OTVO_UOtYO}YO!UZO!Y[O$d!xO$mRO$pWO$t]O~Of!|O!e!eO$e!fO~P(`OTVOc#TOf#POo#RO!x#SO$d#OO!e$wP$e$wP~Oj#XOx!VO$d#WO~O$d#ZO~OTVOc#TOf#POo#RO!x#SO$d#OO~O!l$wP$g$wP~P)_O!l#_O$e#_O$g#_O~Oc#cO~Oc#dO#t${P~O$_$uX!m$uX$a$uX~P`O!l#jO$e#jO$_$uX!m$uX$a$uX~OU#mOV#mO$e#oO$h#mO~OR#qOPiXQiXliXmiX$piXTiXciXfiXoiX!liX!xiX$diX$eiX$giX!eiX!{iX#QiX#SiX#ZiXeiXSiX_iXhiXjiXviXxiX!iiX!jiX!kiX$ciX$oiX$_iXuiX!WiX#hiX#qiX!miX$aiX~OP#vOQ#tOl#rOm#rO$p#sO~Of#xO~Of#yO~O!P$OO$c!iO$d!hO~Ov!cO!e!eO$e!fO~O!m$uP~P`O$`$YO~Of$ZO~Of$[O~O!W$]O![$^O~OS!WOTVO_!WOc!WOf$_Oh!WOj!WOo!TOx!VO$c!UO$d!PO$o!RO~O!e!eO$e!fO~P0oOl#rOm#rO$p#sO!l$wP$e$wP$g$wP~P*ZOl#rOm#rO!l#_O$g#_O$p#sO~O!e!eO!{$eO$e$cO~P2XOl#rOm#rO!e!eO$e!fO$p#sO~O#Q$iO#S$hO$e#_O~P2XOt!]O}!]O!U!^O!Y!_O!^!`O!a!bO$b!aO$p![O~O!l#_O$e#_O$g#_O~P3gOf$lO~P&oO#S$mO~O#Q$qO#Z$pO$e#_O~P2XOTVOc#TOf#POo#RO!x#SO~O$d$rO~P4yOm$uOv$vO!e$wX$e$wX!l$wX$g$wX~Of$yO~Oj$}Ox!VO~O!e%OO~Om$uO!e!eO$e!fO~O!e!eO!l#_O$e$cO$g#_O~O#g%TO~Ov%UO#t${X~O#t%WO~O!l#jO$e#jO$_$ua!m$ua$a$ua~O!l$WX$_$WX$e$WX!m$WX$a$WX~P`OU#mOV#mO$e%`O$h#mO~Oe%aOl#rOm#rO$p#sO~OP%fOQ#tO~Ol#rOm#rO$p#sOPnaQnaTnacnafnaona!lna!xna$dna$ena$gna!ena!{na#Qna#Sna#ZnaenaSna_nahnajnavnaxna!ina!jna!kna$cna$ona$_nauna!Wna#hna#qna!mna$ana~Oj%gOy%gO~OS!WOTVO_!WOf!QOh!WOj!WOo!TOx!VO$c!UO$d!PO$o!RO~Oc%jOe$qP~P;dO!W%mO![%nO~Ot!]O}!]O!U!^O!Y!_O$p![O~Ov!]i!^!]i!a!]i!e!]i$b!]i$e!]i!l!]i$g!]if!]ie!]i~P<kOv!_i!^!_i!a!_i!e!_i$b!_i$e!_i!l!_i$g!_if!_ie!_i~P<kOv!`i!^!`i!a!`i!e!`i$b!`i$e!`i!l!`i$g!`if!`ie!`i~P<kOv$Sa!e$Sa$e$Sa~P3gO!m%oO~O$a$uP~P`Oe$sP~P(`Oe$rP~P%rOS!WOTVO_!WOc!WOf!QOh!WOo!TOx!VO$c!UO$d!PO$o!RO~Oe%xOj%vO~P@POl#rOm#rOv%zO!i%|O!j%|O!k%|O$p#sO!l!fi$e!fi$g!fi$_!fi!m!fi$a!fi~P%rO$`$YOS$yXT$yXW$yXX$yX_$yXc$yXt$yX}$yX!U$yX!Y$yX!o$yX!p$yX!z$yX!}$yX#P$yX#U$yX#W$yX#Y$yX#]$yX#_$yX#a$yX#d$yX#j$yX#l$yX#p$yX#s$yX#v$yX#x$yX$_$yX$d$yX$m$yX$p$yX$t$yX!m$yX!l$yX$e$yX$a$yX~O$d!PO$m&QO~O#S&SO~Ot&TO~O!l#_O#Z$pO$e#_O$g#_O~O!l$zP#Z$zP$e$zP$g$zP~P%rO$d!PO~Oe!qXm!qXt!sX~Ot&ZO~Oe&[Om$uO~Ov$XX!e$XX$e$XX!l$XX$g$XX~P*ZOv$vO!e$wa$e$wa!l$wa$g$wa~Om$uOv!ua!e!ua$e!ua!l!ua$g!uae!ua~O!m&eO#g&cO#h&cO$o&bO~O#m&gOS#kiT#kiW#kiX#ki_#kic#kit#ki}#ki!U#ki!Y#ki!o#ki!p#ki!z#ki!}#ki#P#ki#U#ki#W#ki#Y#ki#]#ki#_#ki#a#ki#d#ki#j#ki#l#ki#p#ki#s#ki#v#ki#x#ki$_#ki$d#ki$m#ki$p#ki$t#ki!m#ki!l#ki$e#ki$a#ki~Oc&iOv$^X#t$^X~Ov%UO#t${a~O!l#jO$e#jO$_$ui!m$ui$a$ui~O!l$Wa$_$Wa$e$Wa!m$Wa$a$Wa~P`O$p#sOPkiQkilkimkiTkickifkioki!lki!xki$dki$eki$gki!eki!{ki#Qki#Ski#ZkiekiSki_kihkijkivkixki!iki!jki!kki$cki$oki$_kiuki!Wki#hki#qki!mki$aki~Ol#rOm#rO$p#sOP$PaQ$Pa~Oe&mO~Ol#rOm#rO$p#sOS#}XT#}X_#}Xc#}Xe#}Xf#}Xh#}Xj#}Xo#}Xu#}Xv#}Xx#}X$c#}X$d#}X$o#}X~Ou&qOv&oOe$qX~P%rOS$nXT$nX_$nXc$nXe$nXf$nXh$nXj$nXl$nXm$nXo$nXu$nXv$nXx$nX$c$nX$d$nX$o$nX$p$nX~Ot&rO~P! {Oe&sO~O$a&uO~Ov&vOe$sX~P3gOe&xO~Ov&yOe$rX~P%rOe&{O~Ol#rOm#rO!W&|O$p#sO~Ot&}Oe$nXl$nXm$nX$p$nX~Oe'QOj'OO~Ol#rOm#rO$p#sOS$VXT$VX_$VXc$VXf$VXh$VXj$VXo$VXv$VXx$VX!i$VX!j$VX!k$VX!l$VX$c$VX$d$VX$e$VX$g$VX$o$VX$_$VX!m$VX$a$VX~Ov%zO!i'TO!j'TO!k'TO!l!fq$e!fq$g!fq$_!fq!m!fq$a!fq~P%rO!l#_O#S'WO$e#_O$g#_O~Ot'XO~Ol#rOm#rOv'ZO$p#sO!l$zX#Z$zX$e$zX$g$zX~Om$uOv$Xa!e$Xa$e$Xa!l$Xa$g$Xa~Oe'_O~P3gOR#qO!eiX$eiX~O!m'bO#g&cO#h&cO$o&bO~O#m'dOS#kqT#kqW#kqX#kq_#kqc#kqt#kq}#kq!U#kq!Y#kq!o#kq!p#kq!z#kq!}#kq#P#kq#U#kq#W#kq#Y#kq#]#kq#_#kq#a#kq#d#kq#j#kq#l#kq#p#kq#s#kq#v#kq#x#kq$_#kq$d#kq$m#kq$p#kq$t#kq!m#kq!l#kq$e#kq$a#kq~O!e!eO#n'eO$e!fO~Ol#rOm#rO#h'gO#q'gO$p#sO~Oc'jOe$OXv$OX~P;dOv&oOe$qa~Ol#rOm#rO!W'nO$p#sO~Oe$RXv$RX~P(`Ov&vOe$sa~Oe$QXv$QX~P%rOv&yOe$ra~Ot&}O~Ol#rOm#rO$p#sOS$VaT$Va_$Vac$Vaf$Vah$Vaj$Vao$Vav$Vax$Va!i$Va!j$Va!k$Va!l$Va$c$Va$d$Va$e$Va$g$Va$o$Va$_$Va!m$Va$a$Va~Oe'wOm$uO~Ov$ZX!l$ZX#Z$ZX$e$ZX$g$ZX~P%rOv'ZO!l$za#Z$za$e$za$g$za~Oe'|O~P%rOu(ROe$Oav$Oa~P%rOt(SO~P! {Ov&oOe$qi~Ov&oOe$qi~P%rOe$Rav$Ra~P3gOe$Qav$Qa~P%rOl#rOm#rOv(UO$p#sOe$Uij$Ui~Ov(UOe$Uij$Ui~Oe(WOm$uO~Ol#rOm#rO$p#sOv$Za!l$Za#Z$Za$e$Za$g$Za~O#n'eO~Ov&oOe$qq~Oe$Oqv$Oq~P%rO$o$pl!al~",
  goto: "9{$|PPPPPPPPPPP$}%X%X%lP%X&P&SP'tPP(yP)xP(yPP(yP(y(y*{+zPPP,WPP%X-]%XP-cP-i-o-u%XP-{P%XP.RP%XP%X%XP%X.X.[P/m0P0ZPPPPP$}PP'h'h0a'h'h'h'hP$}PP$}P$}PP0dP$}P$}P$}PP$}P$}P$}P0j$}P0m0pPP$}P$}PPP$}PP$}PP$}P$}P$}P0s0y1P1o1}2T2Z2a2g2s2y3P3Z3a3k3q3w3}PPPPPPPPPPP4T4W4dP5ZPP7b7e7hP7k7t7z8T8o9u9xanOPqx!e#k$Y%[s^OPefqx!`!a!b!c!e#k$Y$Z$y%[&vsTOPefqx!`!a!b!c!e#k$Y$Z$y%[&vR!OUb^ef!`!a!b!c$Z$y&v`_OPqx!e#k$Y%[!x!WVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]e#Thlm!t#P#R$u$v&T'X!x!WVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]Q&R$iR&Y$q!y!WVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]!x!WVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]T&c%O&d!y!XVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]Q#z!XQ&O$eQ&P$hR'u'W!x!WVabcdgiruv!Q!T!s#r#s#t#y$[$^$_$`$p%T%W%i%n%s%z%{&Z&o&r&y&}'Z'^'e'g'i'm'q(S(]Q#XjR$}#YQ!ZWR#{![Q!jYR#|!]Q#|!lR%l$OQ!kYR#}!]Q#|!kR%l#}Q!nZR$P!^Q!p[R$Q!_R!r]Q!gXQ!{fQ$W!dQ$a!sQ$d!uQ$f!vQ$k!zQ$z#UQ%Q#]Q%R#^Q%S#bQ%X#fQ'U&OQ'`&cQ'f&gQ'h&kQ(O'dQ(X'wQ(Z(PQ([(QR(^(WSpOqUyP!e$YQ#ixQ%]#kR&l%[a`OPqx!e#k$Y%[Q$a!sR't&}R$s#PQ&R$iR']&YR#YjR#[kR%P#[Q#n{R%_#nQqOR#aqQ%i#yQ%s$[^&n%i%s'^'i'm'q(]Q'^&ZQ'i&oQ'm&rQ'q&yR(](SQ&p%iU'k&p'l(TQ'l&qR(T'mQ#u!SR%e#uQ&z%sR'r&zQ&w%qR'p&wQ!dXR$V!dUxP!e$YS#hx%[R%[#kQ%w$_R'P%wQ%{$`R'S%{Q#lyQ%Z#iT%^#l%ZQ$w#QR&_$wQ$n!}S&U$n'zR'z']Q'[&WR'y'[Q&d%OR'a&dQ&f%SR'c&fQ%V#dR&j%VR|QSoOq]wPx!e#k$Y%[`XOPqx!e#k$Y%[Q!yeQ!zfQ$R!`Q$S!aQ$T!bQ$U!cQ%q$ZQ&`$yR'o&vQ!SVQ!taQ!ubQ!vcQ!wdQ!}gQ#ViQ#brQ#fuQ#gvS#p!Q$_Q#w!TQ$`!sQ%b#rQ%c#sQ%d#tl%h#y$[%i%s&Z&o&r&y'^'i'm'q(S(]Q%u$^S%y$`%{Q&W$pQ&h%TQ&k%WQ&t%nQ'R%zQ's&}Q'x'ZQ(P'eR(Q'gR%k#yR%t$[R%r$ZQzPQ$X!eR%p$YX#ky#i#l%ZQ#UhQ#^mR$b!tU#Qhm!tQ#]lQ$t#PQ$x#RQ&]$uQ&^$vQ'Y&TR'v'XQ#`pQ$d!uQ$g!wQ$j!yQ$o!}Q${#VQ$|#XQ%R#^Q%Y#gQ%}$bQ&V$nQ&a$}Q'U&OS'V&P&RQ'{']Q(V'uR(Y'zR&X$pR#et",
  nodeNames: "⚠ InterpolationEnd InterpolationContinue Unit VariableName InterpolationStart LineComment Comment IndentedMixin IndentedInclude StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector SuffixedSelector Suffix Interpolation SassVariableName ValueName ) ( ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp LogicOp UnaryExpression LogicOp NamespacedValue CallExpression Callee ArgList : ... , CallLiteral CallTag ParenthesizedContent ClassSelector ClassName PseudoClassSelector :: PseudoClassName PseudoClassName ArgList PseudoClassName ArgList IdSelector # IdName ] AttributeSelector [ AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp PlaceholderSelector ClassName Block { Declaration PropertyName Map Important Global Default ; } ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery UnaryQuery ParenthesizedQuery SelectorQuery selector IncludeStatement include Keyword MixinStatement mixin UseStatement use Keyword Star Keyword ExtendStatement extend RootStatement at-root ForwardStatement forward Keyword MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList Keyword Keyword SupportsStatement supports IfStatement ControlKeyword ControlKeyword Keyword ForStatement ControlKeyword Keyword EachStatement ControlKeyword Keyword WhileStatement ControlKeyword OutputStatement ControlKeyword AtRule Styles",
  maxTerm: 181,
  context: trackIndent,
  nodeProps: [
    ["openedBy", 1, "InterpolationStart", 5, "InterpolationEnd", 21, "(", 75, "{"],
    ["isolate", -3, 6, 7, 26, ""],
    ["closedBy", 22, ")", 67, "}"]
  ],
  propSources: [cssHighlighting],
  skippedNodes: [0, 6, 7, 135],
  repeatNodeCount: 18,
  tokenData: "!!p~RyOq#rqr$jrs0jst2^tu8{uv;hvw;{wx<^xy={yz>^z{>c{|>||}Co}!ODQ!O!PDo!P!QFY!Q![Fk![!]Gf!]!^Hb!^!_Hs!_!`I[!`!aIs!a!b#r!b!cJt!c!}#r!}#OL^#O#P#r#P#QLo#Q#RMQ#R#T#r#T#UMg#U#c#r#c#dNx#d#o#r#o#p! _#p#qMQ#q#r! p#r#s!!R#s;'S#r;'S;=`!!j<%lO#rW#uSOy$Rz;'S$R;'S;=`$d<%lO$RW$WSyWOy$Rz;'S$R;'S;=`$d<%lO$RW$gP;=`<%l$RY$m[Oy$Rz!_$R!_!`%c!`#W$R#W#X%v#X#Z$R#Z#[)Z#[#]$R#]#^,V#^;'S$R;'S;=`$d<%lO$RY%jSyWlQOy$Rz;'S$R;'S;=`$d<%lO$RY%{UyWOy$Rz#X$R#X#Y&_#Y;'S$R;'S;=`$d<%lO$RY&dUyWOy$Rz#Y$R#Y#Z&v#Z;'S$R;'S;=`$d<%lO$RY&{UyWOy$Rz#T$R#T#U'_#U;'S$R;'S;=`$d<%lO$RY'dUyWOy$Rz#i$R#i#j'v#j;'S$R;'S;=`$d<%lO$RY'{UyWOy$Rz#`$R#`#a(_#a;'S$R;'S;=`$d<%lO$RY(dUyWOy$Rz#h$R#h#i(v#i;'S$R;'S;=`$d<%lO$RY(}S!kQyWOy$Rz;'S$R;'S;=`$d<%lO$RY)`UyWOy$Rz#`$R#`#a)r#a;'S$R;'S;=`$d<%lO$RY)wUyWOy$Rz#c$R#c#d*Z#d;'S$R;'S;=`$d<%lO$RY*`UyWOy$Rz#U$R#U#V*r#V;'S$R;'S;=`$d<%lO$RY*wUyWOy$Rz#T$R#T#U+Z#U;'S$R;'S;=`$d<%lO$RY+`UyWOy$Rz#`$R#`#a+r#a;'S$R;'S;=`$d<%lO$RY+yS!jQyWOy$Rz;'S$R;'S;=`$d<%lO$RY,[UyWOy$Rz#a$R#a#b,n#b;'S$R;'S;=`$d<%lO$RY,sUyWOy$Rz#d$R#d#e-V#e;'S$R;'S;=`$d<%lO$RY-[UyWOy$Rz#c$R#c#d-n#d;'S$R;'S;=`$d<%lO$RY-sUyWOy$Rz#f$R#f#g.V#g;'S$R;'S;=`$d<%lO$RY.[UyWOy$Rz#h$R#h#i.n#i;'S$R;'S;=`$d<%lO$RY.sUyWOy$Rz#T$R#T#U/V#U;'S$R;'S;=`$d<%lO$RY/[UyWOy$Rz#b$R#b#c/n#c;'S$R;'S;=`$d<%lO$RY/sUyWOy$Rz#h$R#h#i0V#i;'S$R;'S;=`$d<%lO$RY0^S!iQyWOy$Rz;'S$R;'S;=`$d<%lO$R~0mWOY0jZr0jrs1Vs#O0j#O#P1[#P;'S0j;'S;=`2W<%lO0j~1[Oj~~1_RO;'S0j;'S;=`1h;=`O0j~1kXOY0jZr0jrs1Vs#O0j#O#P1[#P;'S0j;'S;=`2W;=`<%l0j<%lO0j~2ZP;=`<%l0jZ2cY!UPOy$Rz!Q$R!Q![3R![!c$R!c!i3R!i#T$R#T#Z3R#Z;'S$R;'S;=`$d<%lO$RY3WYyWOy$Rz!Q$R!Q![3v![!c$R!c!i3v!i#T$R#T#Z3v#Z;'S$R;'S;=`$d<%lO$RY3{YyWOy$Rz!Q$R!Q![4k![!c$R!c!i4k!i#T$R#T#Z4k#Z;'S$R;'S;=`$d<%lO$RY4rYhQyWOy$Rz!Q$R!Q![5b![!c$R!c!i5b!i#T$R#T#Z5b#Z;'S$R;'S;=`$d<%lO$RY5iYhQyWOy$Rz!Q$R!Q![6X![!c$R!c!i6X!i#T$R#T#Z6X#Z;'S$R;'S;=`$d<%lO$RY6^YyWOy$Rz!Q$R!Q![6|![!c$R!c!i6|!i#T$R#T#Z6|#Z;'S$R;'S;=`$d<%lO$RY7TYhQyWOy$Rz!Q$R!Q![7s![!c$R!c!i7s!i#T$R#T#Z7s#Z;'S$R;'S;=`$d<%lO$RY7xYyWOy$Rz!Q$R!Q![8h![!c$R!c!i8h!i#T$R#T#Z8h#Z;'S$R;'S;=`$d<%lO$RY8oShQyWOy$Rz;'S$R;'S;=`$d<%lO$R_9O`Oy$Rz}$R}!O:Q!O!Q$R!Q![:Q![!_$R!_!`;T!`!c$R!c!}:Q!}#R$R#R#S:Q#S#T$R#T#o:Q#o;'S$R;'S;=`$d<%lO$RZ:X^yWcROy$Rz}$R}!O:Q!O!Q$R!Q![:Q![!c$R!c!}:Q!}#R$R#R#S:Q#S#T$R#T#o:Q#o;'S$R;'S;=`$d<%lO$R[;[S![SyWOy$Rz;'S$R;'S;=`$d<%lO$RZ;oS$tPlQOy$Rz;'S$R;'S;=`$d<%lO$RZ<QS_ROy$Rz;'S$R;'S;=`$d<%lO$R~<aWOY<^Zw<^wx1Vx#O<^#O#P<y#P;'S<^;'S;=`=u<%lO<^~<|RO;'S<^;'S;=`=V;=`O<^~=YXOY<^Zw<^wx1Vx#O<^#O#P<y#P;'S<^;'S;=`=u;=`<%l<^<%lO<^~=xP;=`<%l<^Z>QSfROy$Rz;'S$R;'S;=`$d<%lO$R~>cOe~_>jU$mPlQOy$Rz!_$R!_!`;T!`;'S$R;'S;=`$d<%lO$RZ?TWlQ!aPOy$Rz!O$R!O!P?m!P!Q$R!Q![Br![;'S$R;'S;=`$d<%lO$RZ?rUyWOy$Rz!Q$R!Q![@U![;'S$R;'S;=`$d<%lO$RZ@]YyW$oROy$Rz!Q$R!Q![@U![!g$R!g!h@{!h#X$R#X#Y@{#Y;'S$R;'S;=`$d<%lO$RZAQYyWOy$Rz{$R{|Ap|}$R}!OAp!O!Q$R!Q![BX![;'S$R;'S;=`$d<%lO$RZAuUyWOy$Rz!Q$R!Q![BX![;'S$R;'S;=`$d<%lO$RZB`UyW$oROy$Rz!Q$R!Q![BX![;'S$R;'S;=`$d<%lO$RZBy[yW$oROy$Rz!O$R!O!P@U!P!Q$R!Q![Br![!g$R!g!h@{!h#X$R#X#Y@{#Y;'S$R;'S;=`$d<%lO$RZCtSvROy$Rz;'S$R;'S;=`$d<%lO$RZDVWlQOy$Rz!O$R!O!P?m!P!Q$R!Q![Br![;'S$R;'S;=`$d<%lO$RZDtW$pROy$Rz!O$R!O!PE^!P!Q$R!Q![@U![;'S$R;'S;=`$d<%lO$RYEcUyWOy$Rz!O$R!O!PEu!P;'S$R;'S;=`$d<%lO$RYE|SuQyWOy$Rz;'S$R;'S;=`$d<%lO$RYF_SlQOy$Rz;'S$R;'S;=`$d<%lO$RZFp[$oROy$Rz!O$R!O!P@U!P!Q$R!Q![Br![!g$R!g!h@{!h#X$R#X#Y@{#Y;'S$R;'S;=`$d<%lO$RZGkUtROy$Rz![$R![!]G}!];'S$R;'S;=`$d<%lO$RXHUS}PyWOy$Rz;'S$R;'S;=`$d<%lO$RZHgS!lROy$Rz;'S$R;'S;=`$d<%lO$RYHxUlQOy$Rz!_$R!_!`%c!`;'S$R;'S;=`$d<%lO$R^IaU![SOy$Rz!_$R!_!`%c!`;'S$R;'S;=`$d<%lO$RZIzV!^PlQOy$Rz!_$R!_!`%c!`!aJa!a;'S$R;'S;=`$d<%lO$RXJhS!^PyWOy$Rz;'S$R;'S;=`$d<%lO$RXJwWOy$Rz!c$R!c!}Ka!}#T$R#T#oKa#o;'S$R;'S;=`$d<%lO$RXKh[!oPyWOy$Rz}$R}!OKa!O!Q$R!Q![Ka![!c$R!c!}Ka!}#T$R#T#oKa#o;'S$R;'S;=`$d<%lO$RXLcS!YPOy$Rz;'S$R;'S;=`$d<%lO$R^LtS!WUOy$Rz;'S$R;'S;=`$d<%lO$R[MTUOy$Rz!_$R!_!`;T!`;'S$R;'S;=`$d<%lO$RZMjUOy$Rz#b$R#b#cM|#c;'S$R;'S;=`$d<%lO$RZNRUyWOy$Rz#W$R#W#XNe#X;'S$R;'S;=`$d<%lO$RZNlSmRyWOy$Rz;'S$R;'S;=`$d<%lO$RZN{UOy$Rz#f$R#f#gNe#g;'S$R;'S;=`$d<%lO$RZ! dS!eROy$Rz;'S$R;'S;=`$d<%lO$RZ! uS!mROy$Rz;'S$R;'S;=`$d<%lO$R]!!WU!aPOy$Rz!_$R!_!`;T!`;'S$R;'S;=`$d<%lO$RW!!mP;=`<%l#r",
  tokenizers: [indentation, descendant, interpolationEnd, unitToken, identifiers, spaces, comments, indentedMixins, 0, 1, 2, 3],
  topRules: { "StyleSheet": [0, 10], "Styles": [1, 134] },
  dialects: { indented: 0 },
  specialized: [{ term: 158, get: (value) => spec_identifier[value] || -1 }, { term: 157, get: (value) => spec_callee[value] || -1 }, { term: 77, get: (value) => spec_AtKeyword[value] || -1 }],
  tokenPrec: 3003
});

// node_modules/@codemirror/lang-sass/dist/index.js
var sassLanguage = LRLanguage.define({
  name: "sass",
  parser: parser.configure({
    props: [
      foldNodeProp.add({
        Block: foldInside,
        Comment(node, state) {
          return { from: node.from + 2, to: state.sliceDoc(node.to - 2, node.to) == "*/" ? node.to - 2 : node.to };
        }
      }),
      indentNodeProp.add({
        Declaration: continuedIndent()
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" }, line: "//" },
    indentOnInput: /^\s*\}$/,
    wordChars: "$-"
  }
});
var indentedSassLanguage = sassLanguage.configure({
  dialect: "indented",
  props: [
    indentNodeProp.add({
      "Block RuleSet": (cx) => cx.baseIndent + cx.unit
    }),
    foldNodeProp.add({
      Block: (node) => ({ from: node.from, to: node.to })
    })
  ]
});
var sassCompletionSource = defineCSSCompletionSource((node) => node.name == "VariableName" || node.name == "SassVariableName");
function sass(config) {
  return new LanguageSupport((config === null || config === void 0 ? void 0 : config.indented) ? indentedSassLanguage : sassLanguage, sassLanguage.data.of({ autocomplete: sassCompletionSource }));
}
export {
  sass,
  sassCompletionSource,
  sassLanguage
};
//# sourceMappingURL=dist-NOLN6JPZ.js.map
