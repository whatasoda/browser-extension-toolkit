import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { readdirSync } from 'fs';

const getEntries = (entrypoints: string) => {
  return readdirSync(entrypoints)
    .filter((file) => /^[^_].+\.tsx?$/.test(file))
    .reduce<Record<string, string>>((acc, file) => {
      const key = path.parse(file).name;
      acc[key] = path.join(entrypoints, file);
      return acc;
    }, {});
};

const createRules = <T extends string>(rules: Record<T, webpack.RuleSetRule>) => {
  const arr = Object.values<webpack.RuleSetRule>(rules);
  return Object.assign(arr, rules) as webpack.RuleSetRule[] & { [K in T]: webpack.RuleSetRule };
};

const WebpackBaseConfig = (mode: webpack.Configuration['mode'], paths: Record<'entrypoints' | 'dist', string>) => {
  const devtool: webpack.Options.Devtool = mode !== 'production' ? 'source-map' : 'nosources-source-map';
  const entry: webpack.Entry = getEntries(paths.entrypoints);
  const output: webpack.Output = {
    path: paths.dist,
    filename: '[name].js',
  };

  const rules = createRules({
    '.ts': {
      enforce: 'pre',
      test: /\.tsx?$/i,
      use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
    },
    '.json.ts': {
      test: /\.json\.tsx?$/i,
      use: [{ loader: 'file-loader', options: { name: '[name]' } }, { loader: 'val-loader' }],
    },
  });

  const optimization: webpack.Options.Optimization = {
    minimize: mode === 'production',
    minimizer: [
      new TerserPlugin({
        sourceMap: false,
        terserOptions: {
          compress: {
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  };

  return {
    mode,
    devtool,
    entry,
    output,
    optimization,
    rules,
  };
};

export default WebpackBaseConfig;
