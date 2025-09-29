/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { TransformFnParams } from '@nestjs/class-transformer';
import { Transform } from '@nestjs/class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from '@nestjs/class-validator';

/**
 * Coerce typical inputs to an integer for validation while preserving strictness:
 * - undefined, null, '' → undefined (optional field)
 * - number/string numeric → truncated integer
 * - anything else → NaN (so @IsInt fails cleanly without stringifying objects)
 */
function coerceIntForValidation(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '' && Number.isFinite(Number(trimmed))) {
      const n = Number(trimmed);
      return n < 0 ? Math.ceil(n) : Math.floor(n);
    }
    return Number.NaN; // non-numeric string → fail @IsInt
  }

  // non-string, non-number → fail @IsInt
  return Number.NaN;
}

export class EchoDto {
  @IsString()
  message!: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => coerceIntForValidation(value), { toClassOnly: true })
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}
