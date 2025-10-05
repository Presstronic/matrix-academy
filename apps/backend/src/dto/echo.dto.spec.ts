/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EchoDto } from './echo.dto.js';

describe('EchoDto', () => {
  describe('message field', () => {
    it('should accept valid string message', async () => {
      const dto = plainToInstance(EchoDto, { message: 'Hello World' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.message).toBe('Hello World');
    });

    it('should reject missing message', async () => {
      const dto = plainToInstance(EchoDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should reject non-string message', async () => {
      const dto = plainToInstance(EchoDto, { message: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('message');
    });
  });

  describe('age field (optional)', () => {
    it('should accept undefined age', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBeUndefined();
    });

    it('should accept valid integer age', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 25 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBe(25);
    });

    it('should transform string number to integer', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: '30' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBe(30);
    });

    it('should floor positive decimal to integer', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 25.7 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBe(25);
    });

    it('should ceil negative decimal to integer', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: -2.3 });
      const errors = await validate(dto);

      expect(errors).not.toHaveLength(0); // Will fail Min(0) validation
    });

    it('should reject age below minimum (0)', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: -1 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('age');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should reject age above maximum (150)', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 151 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('age');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should accept age at minimum boundary (0)', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 0 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBe(0);
    });

    it('should accept age at maximum boundary (150)', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 150 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBe(150);
    });

    it('should reject non-numeric string age', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: 'abc' as unknown });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('age');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should treat empty string as undefined', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBeUndefined();
    });

    it('should treat null as undefined', async () => {
      const dto = plainToInstance(EchoDto, { message: 'test', age: null });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.age).toBeUndefined();
    });
  });
});
