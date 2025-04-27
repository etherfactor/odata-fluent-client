import { createOperatorFactory, Guid } from "../../src";

const o = createOperatorFactory();

describe('Operators', () => {
  //Logical operators
  it('should and', () => {
    const trueValue = o.and(o.bool(true), o.bool(true));
    expect(trueValue.toString()).toBe("(true and true)");
    expect(trueValue.eval()).toBe(true);

    const falseValue = o.and(o.bool(true), o.bool(false));
    expect(falseValue.toString()).toBe("(true and false)");
    expect(falseValue.eval()).toBe(false);
  });

  it('should or', () => {
    const value = o.or(o.bool(true), o.bool(false));
    expect(value.toString()).toBe("(true or false)");
    expect(value.eval()).toBe(true);

    const value2 = o.or(o.bool(false), o.bool(false));
    expect(value2.toString()).toBe("(false or false)");
    expect(value2.eval()).toBe(false);
  });

  it('should not', () => {
    const value = o.not(o.bool(true));
    expect(value.toString()).toBe("not true");
    expect(value.eval()).toBe(false);
  });

  //Comparison operators
  it('should eq', () => {
    const numEq = o.eq(o.int(3), o.int(3));
    expect(numEq.toString()).toBe("3 eq 3");
    expect(numEq.eval()).toBe(true);

    const strEq = o.eq(o.string("a"), o.string("b"));
    expect(strEq.toString()).toBe("'a' eq 'b'");
    expect(strEq.eval()).toBe(false);
  });

  it('should ne', () => {
    const numNe = o.ne(o.int(3), o.int(4));
    expect(numNe.toString()).toBe("3 ne 4");
    expect(numNe.eval()).toBe(true);

    const boolNe = o.ne(o.bool(true), o.bool(true));
    expect(boolNe.toString()).toBe("true ne true");
    expect(boolNe.eval()).toBe(false);

    const strNe = o.ne(o.string("a"), o.string("b"));
    expect(strNe.toString()).toBe("'a' ne 'b'");
    expect(strNe.eval()).toBe(true);
  });

  it('should lt', () => {
    const value = o.lt(o.int(2), o.int(3));
    expect(value.toString()).toBe("2 lt 3");
    expect(value.eval()).toBe(true);

    const value2 = o.lt(o.int(3), o.int(2));
    expect(value2.toString()).toBe("3 lt 2");
    expect(value2.eval()).toBe(false);

    const strLt = o.lt(o.string("a"), o.string("b"));
    expect(strLt.toString()).toBe("'a' lt 'b'");
    expect(strLt.eval()).toBe(true);
  });

  it('should le', () => {
    const value = o.le(o.int(3), o.int(3));
    expect(value.toString()).toBe("3 le 3");
    expect(value.eval()).toBe(true);

    const value2 = o.le(o.int(4), o.int(3));
    expect(value2.toString()).toBe("4 le 3");
    expect(value2.eval()).toBe(false);

    const strLe = o.le(o.string("a"), o.string("b"));
    expect(strLe.toString()).toBe("'a' le 'b'");
    expect(strLe.eval()).toBe(true);
  });

  it('should gt', () => {
    const value = o.gt(o.int(5), o.int(3));
    expect(value.toString()).toBe("5 gt 3");
    expect(value.eval()).toBe(true);

    const value2 = o.gt(o.int(3), o.int(5));
    expect(value2.toString()).toBe("3 gt 5");
    expect(value2.eval()).toBe(false);

    const strGt = o.gt(o.string("a"), o.string("b"));
    expect(strGt.toString()).toBe("'a' gt 'b'");
    expect(strGt.eval()).toBe(false);
  });

  it('should ge', () => {
    const value = o.ge(o.int(5), o.int(5));
    expect(value.toString()).toBe("5 ge 5");
    expect(value.eval()).toBe(true);

    const value2 = o.ge(o.int(3), o.int(5));
    expect(value2.toString()).toBe("3 ge 5");
    expect(value2.eval()).toBe(false);

    const strGe = o.ge(o.string("a"), o.string("b"));
    expect(strGe.toString()).toBe("'a' ge 'b'");
    expect(strGe.eval()).toBe(false);
  });

  //String operators
  it('should contains', () => {
    const value = o.contains(o.string("hello world"), o.string("world"));
    expect(value.toString()).toBe("contains('hello world', 'world')");
    expect(value.eval()).toBe(true);

    const value2 = o.contains(o.string("hello world"), o.string("abc"));
    expect(value2.toString()).toBe("contains('hello world', 'abc')");
    expect(value2.eval()).toBe(false);
  });

  it('should startsWith', () => {
    const value = o.startsWith(o.string("hello world"), o.string("hello"));
    expect(value.toString()).toBe("startswith('hello world', 'hello')");
    expect(value.eval()).toBe(true);

    const value2 = o.startsWith(o.string("hello world"), o.string("world"));
    expect(value2.toString()).toBe("startswith('hello world', 'world')");
    expect(value2.eval()).toBe(false);
  });

  it('should endsWith', () => {
    const value = o.endsWith(o.string("hello world"), o.string("world"));
    expect(value.toString()).toBe("endswith('hello world', 'world')");
    expect(value.eval()).toBe(true);

    const value2 = o.endsWith(o.string("hello world"), o.string("hello"));
    expect(value2.toString()).toBe("endswith('hello world', 'hello')");
    expect(value2.eval()).toBe(false);
  });

  it('should concat', () => {
    const value = o.concat(o.string("foo"), o.string("bar"));
    expect(value.toString()).toBe("concat('foo', 'bar')");
    expect(value.eval()).toBe("foobar");
  });

  it('should indexOf', () => {
    const value = o.indexOf(o.string("hello world"), o.string("world"));
    expect(value.toString()).toBe("indexof('hello world', 'world')");
    expect(value.eval()).toBe(6);

    const value2 = o.indexOf(o.string("hello world"), o.string("abc"));
    expect(value2.toString()).toBe("indexof('hello world', 'abc')");
    expect(value2.eval()).toBe(-1);
  });

  it('should lengthOf', () => {
    const value = o.lengthOf(o.string("hello"));
    expect(value.toString()).toBe("length('hello')");
    expect(value.eval()).toBe(5);
  });

  it('should substring (start only)', () => {
    const value = o.substring(o.string("hello world"), o.int(6));
    expect(value.toString()).toBe("substring('hello world', 6)");
    expect(value.eval()).toBe("world");
  });

  it('should substring (start and finish)', () => {
    const value = o.substring(o.string("hello world"), o.int(0), o.int(5));
    expect(value.toString()).toBe("substring('hello world', 0, 5)");
    expect(value.eval()).toBe("hello");
  });

  it('should toLower', () => {
    const value = o.toLower(o.string("HELLO"));
    expect(value.toString()).toBe("tolower('HELLO')");
    expect(value.eval()).toBe("hello");
  });

  it('should toUpper', () => {
    const value = o.toUpper(o.string("hello"));
    expect(value.toString()).toBe("toupper('hello')");
    expect(value.eval()).toBe("HELLO");
  });

  it('should trim', () => {
    const value = o.trim(o.string("  hello  "));
    expect(value.toString()).toBe("trim('  hello  ')");
    expect(value.eval()).toBe("hello");
  });

  //Arithmetic operators
  it('should add', () => {
    const value = o.add(o.int(1), o.int(2));
    expect(value.toString()).toBe("(1 add 2)");
    expect(value.eval()).toBe(3);
  });

  it('should subtract', () => {
    const value = o.subtract(o.int(5), o.int(3));
    expect(value.toString()).toBe("(5 sub 3)");
    expect(value.eval()).toBe(2);
  });

  it('should multiply', () => {
    const value = o.multiply(o.int(4), o.int(3));
    expect(value.toString()).toBe("(4 mul 3)");
    expect(value.eval()).toBe(12);
  });

  it('should divide', () => {
    const value = o.divide(o.int(10), o.int(2));
    expect(value.toString()).toBe("(10 div 2)");
    expect(value.eval()).toBe(5);
  });

  it('should modulo', () => {
    const value = o.modulo(o.int(10), o.int(3));
    expect(value.toString()).toBe("(10 mod 3)");
    expect(value.eval()).toBe(1);
  });

  it('should ceiling', () => {
    const value = o.ceiling(o.double(1.1));
    expect(value.toString()).toBe("ceiling(1.1)");
    expect(value.eval()).toBe(2);
  });

  it('should floor', () => {
    const value = o.floor(o.double(1.9));
    expect(value.toString()).toBe("floor(1.9)");
    expect(value.eval()).toBe(1);
  });

  it('should round', () => {
    const value = o.round(o.double(1.5));
    expect(value.toString()).toBe("round(1.5)");
    expect(value.eval()).toBe(2);
  });

  //Constant values
  it('should null', () => {
    const value = o.null();
    expect(value.toString()).toBe("null");
    expect(value.eval()).toBe(null);
  });

  it('should bool', () => {
    const value = o.bool(true);
    expect(value.toString()).toBe("true");
    expect(value.eval()).toBe(true);
  });

  it('should date', () => {
    const dateObj = new Date("2020-01-01T00:00:00Z");
    const value = o.date(dateObj);
    expect(value.toString()).toBe(`2020-01-01`);
    expect(value.eval()).toEqual(dateObj);
  });

  it('should dateTime', () => {
    const dateObj = new Date("2020-01-01T12:34:56Z");
    const value = o.dateTime(dateObj);
    expect(value.toString()).toBe(dateObj.toISOString());
    expect(value.eval()).toEqual(dateObj);
  });

  it('should guid', () => {
    const guidVal = "123e4567-e89b-12d3-a456-426614174000" as Guid;
    const value = o.guid(guidVal);
    expect(value.toString()).toBe(guidVal);
    expect(value.eval()).toBe(guidVal);
  });

  it('should string', () => {
    const value = o.string("test");
    expect(value.toString()).toBe("'test'");
    expect(value.eval()).toBe("test");
  });

  it('should time', () => {
    const timeObj = new Date("1970-01-01T15:30:00Z");
    const value = o.time(timeObj);
    expect(value.toString()).toBe(`15:30:00.000`);
    expect(value.eval()).toEqual(timeObj);
  });
});
