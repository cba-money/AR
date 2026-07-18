import { useEffect, useState } from "react";

import { useForm, Controller, SubmitHandler } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

enum ThemeEnum {
  light = "light",
  dark = "dark",
  system = "system"
}

type SettingsInputs = {
  //theme: ThemeEnum;
  exportPath: string;
  tempFilesPath: string;

};

export default function SettingsPage({onUpdatePage}: {onUpdatePage: (newPage: string) => void}) {
  const form = useForm<SettingsInputs>({
    defaultValues:{
      exportPath: ""
    }
  });
  //const onSubmit: SubmitHandler<SettingsInputs> = (data: SettingsInputs) => console.log(data);
    function onSubmit(data: SettingsInputs) {
    console.log(data);
  }

  const [theme, setTheme] = useState<string>("");
  const [defaultExportPath, setDefaultExportPath] = useState<string>("");
  useEffect(() => {
    window.electron.getSettings().then((currentSettings: AppSettings) => {
      setTheme(currentSettings.theme);
      setDefaultExportPath(currentSettings.defaultExportPath);
      form.reset({
        exportPath: currentSettings.defaultExportPath,
        //tempFilesPath: currentSettings.tempFilesPath,
      });
    });
  }, []);

  async function folderPickerDialog(){
      let path = await window.electron.pickFolder();
      console.log(path);
      return path;
  }

  function ControlledSelect(apiData: any) {
    // Always provide a fallback ("") to prevent an initial 'undefined' state
    const [selectedValue, setSelectedValue] = useState(apiData ?? "system");

    // Sync state if apiData loads late
    useEffect(() => {
      if (apiData?.status) {
        setSelectedValue(apiData);
      }
    }, [apiData]);

    return (
      <Select defaultValue={theme.toString()}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System Default</SelectItem>
          </SelectContent>
      </Select>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">

      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure application preferences and processing options.
        </p>
      </div>

      {/* Appearance */}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the application's appearance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>Theme</Label>

              <ControlledSelect apiData={theme} />
              
            </div>

          </CardContent>
        </Card>

        {/* File Locations */}

        <Card>
          <CardHeader>
            <CardTitle>File Locations</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>Default Output Folder</Label>

              <div className="flex gap-2">
                {/*<Input {...register('exportPath')} value={defaultExportPath} readOnly onClick={folderPickerDialog} />*/}
                <Controller
                  name="exportPath"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-demo-title">
                        Bug Title
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-demo-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Login button not working on mobile"
                        autoComplete="off"
                      />
                      {/*defaultValue={defaultExportPath}*/}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Button variant="outline" onClick={folderPickerDialog} type="button">
                  Browse
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Temporary Files</Label>

              <div className="flex gap-2">
                <Input value="C:\\Temp\\ARDesktopSuite" readOnly />
                <Button variant="outline">
                  Browse
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Processing */}

        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <Label>Overwrite Existing Files</Label>
                <p className="text-sm text-muted-foreground">
                  Replace output files without prompting.
                </p>
              </div>

              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Create Processing Logs</Label>
                <p className="text-sm text-muted-foreground">
                  Save detailed logs for each job.
                </p>
              </div>

              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Automatically Open Output Folder</Label>
                <p className="text-sm text-muted-foreground">
                  Open the destination folder when processing completes.
                </p>
              </div>

              <Switch defaultChecked />
            </div>

          </CardContent>
        </Card>

        {/* Updates */}

        <Card>
          <CardHeader>
            <CardTitle>Updates</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex justify-between items-center">
              <div>
                <Label>Automatic Updates</Label>

                <p className="text-sm text-muted-foreground">
                  Download updates automatically when available.
                </p>
              </div>

              <Switch defaultChecked />
            </div>

            <Button variant="outline">
              Check for Updates
            </Button>

          </CardContent>
        </Card>

        {/* Diagnostics */}

        <Card>
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            <Button variant="secondary">
              Open Log Folder
            </Button>

            <Button variant="secondary">
              Export Diagnostic Report
            </Button>

            <Button variant="outline">
              Clear Cache
            </Button>

          </CardContent>
        </Card>

        {/* Save */}

        <div className="flex justify-end gap-3">

          <Button variant="outline" onClick={() => onUpdatePage('dashboard')} type="button">
            Cancel
          </Button>

          <Button type="submit">
            Save Settings
          </Button>

        </div>
      </form>
    </div>
  );
}