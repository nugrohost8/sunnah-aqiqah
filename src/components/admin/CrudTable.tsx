import { DeleteButton, SubmitButton } from "./Buttons";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select";
  options?: { value: string; label: string }[];
  /** Lebar kolom CSS grid, mis. "1fr" atau "120px". */
  width?: string;
  required?: boolean;
  placeholder?: string;
};

type Row = { id: number } & Record<string, unknown>;
type Action = (formData: FormData) => Promise<void>;

/**
 * Daftar baris yang bisa diedit langsung + satu baris untuk menambah data.
 * Setiap baris adalah <form> tersendiri yang memanggil server action `save` / `remove`.
 */
export function CrudTable({
  fields,
  rows,
  save,
  remove,
  hidden,
  newDefaults = {},
  addLabel = "Tambah",
}: {
  fields: Field[];
  rows: Row[];
  save: Action;
  remove: Action;
  /** Nilai tetap yang ikut dikirim setiap baris, mis. { kind: "masak" }. */
  hidden?: Record<string, string>;
  newDefaults?: Record<string, unknown>;
  addLabel?: string;
}) {
  const columns = `${fields.map((f) => f.width ?? "1fr").join(" ")} auto`;

  return (
    <div className="crud">
      <div className="crud__head" style={{ gridTemplateColumns: columns }}>
        {fields.map((f) => (
          <span key={f.name}>{f.label}</span>
        ))}
        <span />
      </div>

      {rows.map((row) => (
        // key berisi nilai baris agar form dipasang ulang (dan input ikut ter-reset) saat data berubah.
        <form key={`${row.id}:${JSON.stringify(row)}`} action={save} className="crud__row" style={{ gridTemplateColumns: columns }}>
          <input type="hidden" name="id" value={row.id} />
          <HiddenInputs values={hidden} />
          {fields.map((f) => (
            <FieldInput key={f.name} field={f} value={row[f.name]} />
          ))}
          <div className="crud__actions">
            <SubmitButton>Simpan</SubmitButton>
            <DeleteButton action={remove} />
          </div>
        </form>
      ))}

      {rows.length === 0 && <p className="crud__empty">Belum ada data.</p>}

      <form action={save} className="crud__row crud__row--new" style={{ gridTemplateColumns: columns }}>
        <HiddenInputs values={hidden} />
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} value={newDefaults[f.name]} />
        ))}
        <div className="crud__actions">
          <SubmitButton pendingText="Menambah…">+ {addLabel}</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function HiddenInputs({ values }: { values?: Record<string, string> }) {
  return Object.entries(values ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
}

function FieldInput({ field: f, value }: { field: Field; value: unknown }) {
  const common = { name: f.name, "aria-label": f.label, required: f.required, placeholder: f.placeholder };

  switch (f.type) {
    case "textarea":
      return <textarea {...common} rows={2} defaultValue={(value as string) ?? ""} />;
    case "checkbox":
      return (
        <label className="crud__check">
          <input type="checkbox" name={f.name} aria-label={f.label} defaultChecked={value === undefined ? true : Boolean(value)} />
        </label>
      );
    case "select":
      return (
        <select {...common} defaultValue={(value as string) ?? f.options?.[0]?.value}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "number":
      return <input {...common} type="number" min={0} max={2_000_000_000} defaultValue={value == null ? "" : String(value)} />;
    default:
      return <input {...common} type="text" defaultValue={(value as string) ?? ""} />;
  }
}
