import type enMessages from "./en";

/** `en` là nguồn chuẩn: kiểu của mọi locale suy ra từ đây. */
export type Messages = typeof enMessages;
export type Namespace = keyof Messages;

export type DeepPartial<T> = T extends string ? T : { [K in keyof T]?: DeepPartial<T[K]> };

/** Giá trị số nhiều: chọn theo Intl.PluralRules khi truyền params.count. */
export type PluralForms = { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string };

/** Mọi key (dạng "a.b.c") trỏ tới chuỗi hoặc PluralForms trong một namespace. */
export type MessageKey<T> = {
  [K in keyof T & string]: T[K] extends string ? K : T[K] extends PluralForms ? K : `${K}.${MessageKey<T[K]>}`;
}[keyof T & string];
