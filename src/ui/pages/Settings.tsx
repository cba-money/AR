import { useEffect, useState, useId } from "react";

import { useForm, Controller, SubmitHandler } from "react-hook-form";

import { useRouter } from '@/hooks/useRouter.tsx';
import { useAppSettings } from "@/hooks/useAppSettings.ts";

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
//import { Textarea } from "@/components/ui/textarea.tsx";

import { toast } from "sonner";

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
  theme: ThemeEnum;
  defaultExportPath: string;
  tmpFolder: string;
};

export default function SettingsPage() {

  const { navigate, path } = useRouter();
  const { settings, isLoading, error } = useAppSettings();

  const form = useForm<SettingsInputs>({
    defaultValues:{
      theme: ThemeEnum.system,
      defaultExportPath: "",
      tmpFolder: ""
    }
  });

  function onSubmit(data: SettingsInputs) {
    //console.log(data);
    window.electron.updateSettings(data);
    //display successful or failure toast 
    // toast.success("Your application settings have been updated.");
    window.location.reload();
  }
  
  useEffect(() => {
    if(settings){
      form.reset({
          theme: settings.theme as ThemeEnum,
          defaultExportPath: settings.defaultExportPath,
          tmpFolder: settings.tmpFolder,
      });
    }
  }, [settings])

  // Open a dialog window to pick a folder
  async function openFolderPickerDialog(formInput: keyof SettingsInputs){
      let path = await window.electron.pickFolder();
      //console.log(path);
      if(path !== null){
        //defaultOutputFolderRef.current.value = path;
        //defaultOutputFolderRef.current = path;
        form.setValue(formInput, path);
        //console.log(path);
      }
      return path;
  }

  function ControlledSelect(props: {
    selectName: keyof SettingsInputs;
    selectLabel: string;
  }) {
    const selectId = useId();
   
    return (
      <Controller
        name={props.selectName}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} aria-label={props.selectLabel}>
            <FieldLabel htmlFor={selectId}>
              {props.selectLabel}
            </FieldLabel>
            <Select 
              {...field} 
              id={selectId}
              aria-invalid={fieldState.invalid}
              value={field.value}
              onValueChange={field.onChange}
            >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
            </Select>
          </Field>
        )}
      />
    )
  }

  function FileInputField(props: { 
    inputName: keyof SettingsInputs;
    inputLabel: string;
  }){
    const inputId = useId();
    return (
      <Controller
        name={props.inputName}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={inputId}>
              {props.inputLabel}
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                {...field}
                id={inputId}
                aria-invalid={fieldState.invalid}
                placeholder="Choose a location..."
                autoComplete="off"
                className="inline-flex"
                onClick={() => openFolderPickerDialog(props.inputName)} 
              />
              <Button 
                variant="outline" 
                onClick={() => openFolderPickerDialog(props.inputName)} 
                type="button"
                className="inline-flex">
                Browse
              </Button>
            </div>
            {/*defaultValue={defaultExportPath}*/}
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    );
  }

  function switchField(props: {
    inputName: keyof SettingsInputs;
    inputLabel: string;
    inputDescription: string;
  }){
    return (
      <div className="flex items-center justify-between">
        <div>
          <Label>{props.inputLabel}</Label>
          <p className="text-sm text-muted-foreground">
            {props.inputDescription}
          </p>
        </div>

        <Switch defaultChecked />
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  if (error) {
    return <div>Error loading settings: {error.message}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">

      <div className="select-none">
        <h1 className="text-3xl font-bold">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure application preferences and processing options.
        </p>
      </div>

      {/* Appearance */}

      <form id="form-settings" onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
        <Card>
          <CardHeader className="select-none">
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the application's appearance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">

              <ControlledSelect selectName="theme" selectLabel="Theme" />
              
            </div>

          </CardContent>
        </Card>

        {/* File Locations */}

        <Card>
          <CardHeader className="select-none">
            <CardTitle>File Locations</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex gap-2">
                  <FileInputField 
                    inputName="defaultExportPath" 
                    inputLabel="Default Output Folder" 
                  />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <FileInputField 
                  inputName="tmpFolder" 
                  inputLabel="Temporary Files" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing */}

        <Card>
          <CardHeader className="select-none">
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
          <CardHeader className="select-none">
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
          <CardHeader className="select-none">
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 space-x-2">

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

          <Button variant="outline" onClick={() => navigate('/')} type="button">
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