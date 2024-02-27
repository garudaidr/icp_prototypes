/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANISTER_ORIGIN: string | undefined;
  readonly DATABASE_CANISTER_PRINCIPAL: string | undefined;
  readonly AZLE_TEST_FETCH: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
