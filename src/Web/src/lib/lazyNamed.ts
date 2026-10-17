import { lazy, type ComponentType } from "react";

// React.lazy exige export default; as páginas usam export nomeado
export function lazyNamed<K extends string>(
    factory: () => Promise<Record<K, ComponentType>>,
    name: K,
) {
    return lazy(() => factory().then((m) => ({ default: m[name] })));
}
