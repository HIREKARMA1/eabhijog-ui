import { SetBreadcrumb } from "@/components/shell/BreadcrumbContext";
import { TaxonomyTreePanel } from "@/components/departments/TaxonomyTreePanel";

export default function PsTaxonomyPage() {
  return (
    <>
      <SetBreadcrumb>
        <strong>Department Taxonomy</strong>
      </SetBreadcrumb>
      <TaxonomyTreePanel />
    </>
  );
}
