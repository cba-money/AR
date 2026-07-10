import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Badge } from "@/components/ui/badge.tsx";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">

      <div>
        <h1 className="text-4xl font-bold">About A/R Desktop Suite</h1>
        <p className="text-muted-foreground mt-2">
          Professional Excel automation tools for Accounts Receivable operations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
          <CardDescription>
            Current installation details
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Application</span>
            <Badge>A/R Desktop Suite</Badge>
          </div>

          <div className="flex justify-between">
            <span>Version</span>
            <span>1.0.0</span>
          </div>

          <div className="flex justify-between">
            <span>Build</span>
            <span>Release</span>
          </div>

          <div className="flex justify-between">
            <span>Platform</span>
            <span>Windows</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>

        <CardContent>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Select the desired tool from the navigation menu.</li>
            <li>Choose one or more Excel workbooks.</li>
            <li>Configure any processing options.</li>
            <li>Click <strong>Process</strong>.</li>
            <li>Review the generated output in your selected destination folder.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Included Modules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <strong>A/R Formatter</strong>
            <p className="text-muted-foreground">
              Formats and standardizes Accounts Receivable spreadsheets.
            </p>
          </div>

          <Separator />

          <div>
            <strong>Check Run Auditor</strong>
            <p className="text-muted-foreground">
              Compares check registers and payment files for discrepancies.
            </p>
          </div>

          <Separator />

          <div>
            <strong>Reports</strong>
            <p className="text-muted-foreground">
              Generates operational and reconciliation reports.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Software</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p>Electron</p>
          <p>React</p>
          <p>Vite</p>
          <p>TypeScript</p>
          <p>Tailwind CSS</p>
          <p>shadcn/ui</p>
          <p>ExcelJS</p>
          <p>Lucide React</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            For technical support, feature requests, or bug reports,
            contact your system administrator or software provider.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Copyright & License</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            © 2026 Blazed Labs LLC. All Rights Reserved.
          </p>

          <p>
            This software is proprietary and confidential. Unauthorized
            copying, modification, reverse engineering, redistribution,
            or resale is prohibited except where expressly permitted by
            applicable law or written agreement.
          </p>

          <p>
            Microsoft Excel is a trademark of Microsoft Corporation.
            All other trademarks belong to their respective owners.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}