# typed: false
# frozen_string_literal: true

# Innsegall · Macintosh triage · Battle Scout
# Tap install: brew tap SP-Q26/innsegall && brew install innsegall
class Innsegall < Formula
  desc "Post-scare Macintosh triage · local Battle Scout · not antivirus"
  homepage "https://innsegall.com"
  license "MIT"
  head "https://github.com/SP-Q26/innsegall.git", branch: "main"

  # When tagging releases, switch to stable url + sha256:
  # url "https://github.com/SP-Q26/innsegall/archive/refs/tags/v0.4.0-alpha.tar.gz"
  # sha256 "..."

  depends_on "node@20"

  def install
    libexec.install Dir["*"]
    (bin/"innsegall").write_env_script libexec/"bin/innsegall.mjs", PATH: "#{Formula["node@20"].opt_bin}:$PATH"
  end

  def caveats
    <<~EOS
      Innsegall is alpha software. Read the runes before your first scout:
        innsegall runes
        innsegall run

      Stability policy: https://innsegall.com/stability
    EOS
  end

  test do
    system bin/"innsegall", "runes"
  end
end
