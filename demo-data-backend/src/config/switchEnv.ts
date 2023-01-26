interface Cases<T> {
  [key: string]: T | EnvRef;
}

class EnvRef {
  constructor(readonly env: string) {}
}

function resolveRef<T>(cases: Cases<T>, ref: EnvRef): T {
  if (!Object.prototype.hasOwnProperty.call(cases, ref.env)) {
    throw new Error(`Invalid envRef: ${ref.env}`);
  }

  const valOrRef = cases[ref.env];
  if (valOrRef instanceof EnvRef) {
    return resolveRef(cases, valOrRef);
  } else {
    return valOrRef;
  }
}

export function envRef(env: string): EnvRef {
  return new EnvRef(env);
}

export function switchEnv<T>(cases: Cases<T>, defaultVal: T): T {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is required');
  }

  if (Object.prototype.hasOwnProperty.call(cases, process.env.NODE_ENV)) {
    return resolveRef(cases, envRef(process.env.NODE_ENV));
  }

  return defaultVal;
}
