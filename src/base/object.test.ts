import { set, clone } from './object';

describe('set', () => {
  it('should return new value', () => {
    const value = { foo: 'bar' };
    const newValue = set(value, 'foo', 'foo');
    expect(value).toMatchInlineSnapshot(`
      Object {
        "foo": "bar",
      }
    `);
    expect(newValue).toMatchInlineSnapshot(`
      Object {
        "foo": "foo",
      }
    `);
  });

  it('should handle path', () => {
    expect(set({}, 'a.b.c', 'd')).toMatchInlineSnapshot(`
      Object {
        "a": Object {
          "b": Object {
            "c": "d",
          },
        },
      }
    `);
  });
});

describe('clone', () => {
  it('should clone object', () => {
    const obj1 = { a: { b: 'c' } };
    const obj2 = clone(obj1);
    expect(obj1).not.toBe(obj2);
    expect(obj1).toMatchInlineSnapshot(`
      Object {
        "a": Object {
          "b": "c",
        },
      }
    `);
    expect(obj2).toMatchInlineSnapshot(`
      Object {
        "a": Object {
          "b": "c",
        },
      }
    `);
  });
});
