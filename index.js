const fs = require('fs');
const path = require('path');
const os = require('os');
const {promisify} = require('util');

const https = require('follow-redirects').https;
const targz = require('targz');

function gen_opts(){
  const namespace = 'samsieber/atlas-coverage';
  const binName = 'atlas-coverage';
  const version = 'v0.1.1';
  const format = 'tar.gz';

  const opts = {
    namespace,

    binName,
    version,
    arch: "",
    vendor: "unknown",
    platform: os.platform(),
    format,
  };
  switch (opts.platform) {
    case 'darwin':
      opts.arch = 'x64';
      opts.vendor = 'apple';
      break;
    // case 'win32':
    //   opts.arch = process.env.npm_config_arch || os.arch();
    case 'linux':
      opts.arch = process.env.npm_config_arch || os.arch();
      opts.platform = 'linux-musl';
      break;
    default: throw new Error('Unsupported platform: ' + opts.platform);
  }

  switch (opts.arch) {
    case 'x64':
      opts.arch = 'x86_64';
      break;
    case 'x86':
      opts.arch = 'i686';
      break
    default: throw new Error('Unsupported architecture: ' + opts.arch);
  }

  function format_opts(opts) {
    return `${opts.binName}-${opts.version}-${opts.arch}-${opts.vendor}-${opts.platform}`
  }

  function format_opts_url(opts) {
    return `https://github.com/${opts.namespace}/releases/download/${opts.version}/${format_opts(opts)}.${opts.format}`
  }

  return {
    value: opts,
    format: format_opts,
    url: format_opts_url,
  }
}

async function initalize({cachePath, download}) {
  const opts = gen_opts();
  const bin = path.resolve(cachePath, 'atlas-bin');
  const dir = path.resolve(bin, `${opts.format(opts.value)}`);
  const archive = path.resolve(dir, `atlas-coverage.${opts.value.format}`);
  const exec = path.resolve(dir, 'atlas-coverage');

  if (download == undefined) {
    download = true;
  }

  function decompress() {
    return promisify(targz.decompress)({
      src: archive,
      dest: dir,
    });
  }

  function downloadAtlas() {
    return new Promise(function (resolve, reject) {
      var fileStream = fs.createWriteStream(archive);
      console.log(opts.url(opts.value));
      var request = https.get(opts.url(opts.value), function (response) {
        let pipe = response.pipe(fileStream);
        pipe.on('finish', resolve);
      });
    });
  }

  function run({configPath, outputPath, inputFolder}){
    runWithArgs(["--config", configPath,"--output", outputPath, inputFolder]);
  }
  function runWithArgs(args){
    const { spawnSync } = require( 'child_process' );
    spawnSync(exec, args , {stdio: 'inherit'});
  }

  if (!fs.exists(exec)) {
    if (download) {
      if (!fs.existsSync(bin)) {
        fs.mkdirSync(bin);
      }
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (!fs.existsSync(archive)) {
        await downloadAtlas();
      }
    }
    await decompress();
  }

  return { run, runWithArgs }
}

exports.initialize = initalize;

