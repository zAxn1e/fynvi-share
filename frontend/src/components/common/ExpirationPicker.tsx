import {
  Badge,
  Box,
  Button as MantineButton,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import moment from "moment";
import React, { useState } from "react";
import {
  TbCalendar,
  TbCalendarEvent,
  TbCalendarTime,
  TbCheck,
  TbClock,
  TbInfinity,
} from "react-icons/tb";
import { Timespan } from "../../types/timespan.type";

export interface ExpirationPickerProps {
  value: string; // ISO date string, or relative like "7-days", or "never"
  onChange: (value: string, isNever: boolean) => void;
  maxExpiration?: Timespan;
  allowNever?: boolean;
}

interface PresetOption {
  label: string;
  duration: number;
  unit: moment.unitOfTime.DurationConstructor;
  value: string;
  isNever?: boolean;
}

export const ExpirationPicker: React.FC<ExpirationPickerProps> = ({
  value,
  onChange,
  maxExpiration,
  allowNever = true,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const isUnlimitedAllowed =
    allowNever && (!maxExpiration || maxExpiration.value === 0);

  const presets: PresetOption[] = [
    { label: "1 Hour", duration: 1, unit: "hours", value: "1-hours" },
    { label: "12 Hours", duration: 12, unit: "hours", value: "12-hours" },
    { label: "1 Day", duration: 1, unit: "days", value: "1-days" },
    { label: "3 Days", duration: 3, unit: "days", value: "3-days" },
    { label: "7 Days", duration: 7, unit: "days", value: "7-days" },
    { label: "14 Days", duration: 14, unit: "days", value: "14-days" },
    { label: "30 Days", duration: 30, unit: "days", value: "30-days" },
  ];

  if (isUnlimitedAllowed) {
    presets.push({
      label: "Never (No Limit)",
      duration: 0,
      unit: "days",
      value: "never",
      isNever: true,
    });
  }

  // Filter presets that exceed maxExpiration
  const allowedPresets = presets.filter((preset) => {
    if (preset.isNever) return isUnlimitedAllowed;
    if (!maxExpiration || maxExpiration.value === 0) return true;
    const maxDuration = moment.duration(
      maxExpiration.value,
      maxExpiration.unit,
    );
    const presetDuration = moment.duration(preset.duration, preset.unit);
    return presetDuration.asMilliseconds() <= maxDuration.asMilliseconds();
  });

  const isNever = value === "never";
  const [customMode, setCustomMode] = useState<boolean>(() => {
    if (value === "never") return false;
    return !presets.some((p) => p.value === value);
  });

  // Calculate current effective date for custom input
  const getInitialCustomDateTime = () => {
    if (value && value !== "never") {
      if (value.includes("-")) {
        const parts = value.split("-");
        const num = parseInt(parts[0]);
        const unit = parts[1] as moment.unitOfTime.DurationConstructor;
        return moment().add(num, unit).format("YYYY-MM-DDTHH:mm");
      }
      const parsed = moment(value);
      if (parsed.isValid()) {
        return parsed.format("YYYY-MM-DDTHH:mm");
      }
    }
    return moment().add(7, "days").format("YYYY-MM-DDTHH:mm");
  };

  const [customDateTime, setCustomDateTime] = useState<string>(
    getInitialCustomDateTime(),
  );

  const handleSelectPreset = (preset: PresetOption) => {
    setCustomMode(false);
    if (preset.isNever) {
      onChange("never", true);
    } else {
      onChange(preset.value, false);
    }
  };

  const handleCustomDateTimeChange = (val: string) => {
    setCustomDateTime(val);
    if (val) {
      const date = moment(val);
      if (date.isValid()) {
        onChange(date.toISOString(), false);
      }
    }
  };

  const getExpirationSummary = () => {
    if (isNever) {
      return {
        title: "Never Expires",
        subtitle: "Link remains valid indefinitely until manually removed",
        color: "blue",
      };
    }

    let targetDate: moment.Moment;
    if (value.includes("-")) {
      const parts = value.split("-");
      const num = parseInt(parts[0]);
      const unit = parts[1] as moment.unitOfTime.DurationConstructor;
      targetDate = moment().add(num, unit);
    } else {
      targetDate = moment(value);
    }

    if (!targetDate.isValid()) {
      return {
        title: "Invalid Date",
        subtitle: "Please select a valid future date",
        color: "red",
      };
    }

    const fromNow = targetDate.fromNow();
    const formatted = targetDate.format("dddd, MMMM D, YYYY [at] h:mm A");

    return {
      title: `Expires ${fromNow}`,
      subtitle: formatted,
      color: "cyan",
    };
  };

  const summary = getExpirationSummary();

  return (
    <Stack spacing={12}>
      {/* Expiration Status Header Card */}
      <Box
        p={14}
        sx={{
          backgroundColor: isDark
            ? "var(--surface-1, #151B24)"
            : "var(--surface-1, #F1F5F9)",
          borderRadius: "var(--radius-md, 10px)",
          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        }}
      >
        <Group position="apart" align="center">
          <Group spacing={10}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm, 6px)",
                backgroundColor: isNever
                  ? "rgba(59, 130, 246, 0.15)"
                  : "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isNever ? "#3B82F6" : "#06B6D4",
              }}
            >
              {isNever ? <TbInfinity size={20} /> : <TbClock size={20} />}
            </Box>
            <Stack spacing={1}>
              <Text size="xs" weight={700} sx={{ letterSpacing: "-0.01em" }}>
                {summary.title}
              </Text>
              <Text size="xs" color="dimmed" sx={{ fontSize: 11 }}>
                {summary.subtitle}
              </Text>
            </Stack>
          </Group>
          <Badge
            size="sm"
            variant="outline"
            color={summary.color}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isNever ? "Permanent" : "Auto-Expiring"}
          </Badge>
        </Group>
      </Box>

      {/* Preset Quick Chips */}
      <Box>
        <Text size="xs" weight={600} color="dimmed" mb={8}>
          Quick Presets
        </Text>
        <Grid gutter={6}>
          {allowedPresets.map((preset) => {
            const isSelected =
              !customMode &&
              (preset.isNever ? isNever : value === preset.value);

            return (
              <Grid.Col span={4} key={preset.value}>
                <UnstyledButton
                  onClick={() => handleSelectPreset(preset)}
                  sx={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md, 8px)",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected
                      ? isDark
                        ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.18))"
                        : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.12))"
                      : isDark
                        ? "var(--surface-2, #1C2430)"
                        : "var(--surface-2, #E2E8F0)",
                    border: isSelected
                      ? "1px solid var(--brand-primary, #3B82F6)"
                      : "1px solid transparent",
                    color: isSelected
                      ? "var(--brand-primary, #3B82F6)"
                      : isDark
                        ? "var(--text-secondary, #94A3B8)"
                        : "var(--text-secondary, #475569)",
                    transition: "all var(--transition-fast, 150ms ease)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    "&:hover": {
                      borderColor: "var(--brand-primary, #3B82F6)",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                  }}
                >
                  {isSelected && <TbCheck size={13} />}
                  <span>{preset.label}</span>
                </UnstyledButton>
              </Grid.Col>
            );
          })}

          <Grid.Col span={4}>
            <UnstyledButton
              onClick={() => {
                setCustomMode(true);
                handleCustomDateTimeChange(customDateTime);
              }}
              sx={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "var(--radius-md, 8px)",
                textAlign: "center",
                fontSize: 12,
                fontWeight: customMode ? 600 : 500,
                backgroundColor: customMode
                  ? isDark
                    ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.18))"
                    : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.12))"
                  : isDark
                    ? "var(--surface-2, #1C2430)"
                    : "var(--surface-2, #E2E8F0)",
                border: customMode
                  ? "1px solid var(--brand-primary, #3B82F6)"
                  : "1px solid transparent",
                color: customMode
                  ? "var(--brand-primary, #3B82F6)"
                  : isDark
                    ? "var(--text-secondary, #94A3B8)"
                    : "var(--text-secondary, #475569)",
                transition: "all var(--transition-fast, 150ms ease)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                "&:hover": {
                  borderColor: "var(--brand-primary, #3B82F6)",
                },
              }}
            >
              <TbCalendarEvent size={14} />
              <span>Custom Date</span>
            </UnstyledButton>
          </Grid.Col>
        </Grid>
      </Box>

      {/* Custom Date & Time Picker inputs */}
      {customMode && (
        <Box
          p={12}
          sx={{
            backgroundColor: isDark
              ? "var(--surface-2, #1C2430)"
              : "var(--surface-2, #E2E8F0)",
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.12))",
          }}
        >
          <TextInput
            type="datetime-local"
            label="Pick Exact Date & Time"
            size="sm"
            variant="filled"
            value={customDateTime}
            onChange={(e) => handleCustomDateTimeChange(e.currentTarget.value)}
            min={moment().format("YYYY-MM-DDTHH:mm")}
            sx={{
              input: {
                backgroundColor: isDark
                  ? "var(--surface-1, #151B24)"
                  : "#FFFFFF",
              },
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default ExpirationPicker;
