import { createAtm } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { FiSave } from "react-icons/fi";

export default function NewAtmPage() {
  return (
    <div className="max-w-md">
      <PageHeader title="Tambah ATM" />

      <Card>
        <ActionForm
          action={createAtm}
          successMessage="ATM berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="TID" htmlFor="tid">
            <Input id="tid" name="tid" type="number" required />
          </Field>

          <Field label="Location" htmlFor="location">
            <Input id="location" name="location" type="text" required />
          </Field>

          <Field label="Branch" htmlFor="branch">
            <Input id="branch" name="branch" type="text" required />
          </Field>

          <Field label="SSB" htmlFor="ssb">
            <Input id="ssb" name="ssb" type="text" required />
          </Field>

          <Button variant="success" type="submit" className="mt-2 self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
