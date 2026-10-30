import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * true setelah React selesai hydrate di browser. Dipakai untuk menonaktifkan tombol kirim admin
 * sampai JavaScript siap: kiriman form native (tanpa JS) pada halaman admin yang isinya di dalam
 * <Suspense> menghasilkan halaman kosong di Next 16.4.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
