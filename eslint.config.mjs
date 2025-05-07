// eslint.config.mjs
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',  // Tắt cảnh báo 'any'
      '@typescript-eslint/no-floating-promises': 'warn',  // Cảnh báo nếu có promise chưa được xử lý
      '@typescript-eslint/no-unsafe-argument': 'warn',  // Cảnh báo khi có argument không an toàn
      '@typescript-eslint/no-unsafe-assignment': 'off',  // Tắt cảnh báo khi gán giá trị 'unsafe'
      '@typescript-eslint/no-unsafe-call': 'off',  // Tắt cảnh báo khi gọi phương thức 'unsafe'
      '@typescript-eslint/no-unsafe-member-access': 'off',  // Tắt cảnh báo khi truy cập thành viên 'unsafe'
    },
  }
);
