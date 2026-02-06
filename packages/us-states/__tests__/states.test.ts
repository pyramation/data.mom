import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

describe('us_states', () => {
  it('should select a state by abbreviation', async () => {
    const result = await pg.query(
      `SELECT state, abbreviation, population FROM us_states WHERE abbreviation = $1`,
      ['CA']
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].state).toBe('California');
    expect(result.rows[0].population).toBe('39538223');
  });

  it('should select states by name pattern', async () => {
    const result = await pg.query(
      `SELECT state, abbreviation FROM us_states WHERE state LIKE 'New %' ORDER BY state`
    );
    expect(result.rows).toHaveLength(4);
    expect(result.rows.map((r: any) => r.state)).toEqual([
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
    ]);
  });

  it('should select states with population over 20 million', async () => {
    const result = await pg.query(
      `SELECT state, population FROM us_states WHERE population::int > 20000000 ORDER BY population::int DESC`
    );
    expect(result.rows).toHaveLength(4);
    expect(result.rows.map((r: any) => r.state)).toEqual([
      'California',
      'Texas',
      'Florida',
      'New York',
    ]);
  });

  it('should count all 50 states', async () => {
    const result = await pg.query(`SELECT COUNT(*)::int AS total FROM us_states`);
    expect(result.rows[0].total).toBe(50);
  });
});
