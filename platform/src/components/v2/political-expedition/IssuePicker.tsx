import { IssueOption } from "./types";
import { IssueCard } from "./IssueCard";

type IssuePickerProps = {
  issues: IssueOption[];
  activeIssue: IssueOption["key"];
  onSelect: (issue: IssueOption["key"]) => void;
};

export function IssuePicker({ issues, activeIssue, onSelect }: IssuePickerProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" data-xray-id="political-expedition-issue-picker">
      {issues.map((issue) => (
        <IssueCard key={issue.key} issue={issue} active={issue.key === activeIssue} onSelect={onSelect} />
      ))}
    </section>
  );
}
