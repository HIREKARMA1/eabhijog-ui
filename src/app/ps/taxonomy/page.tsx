import { PsLayout } from "@/components/layout/PsLayout";
import { TaxonomyTreePanel } from "@/components/departments/TaxonomyTreePanel";

export default function PsTaxonomyPage() {
  return (
    <PsLayout breadcrumb={<strong>Department Taxonomy</strong>}>
      <TaxonomyTreePanel />
    </PsLayout>
  );
}
