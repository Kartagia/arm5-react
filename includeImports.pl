use english;
##
## PERL script constructing a file with imports of JSX components replaced with 
## imported JSX definition.
##
## The JSX file is assumed to contain only the exported JSX components.

my $mode = "imports";
my %imported = {};

## PROTO: addImports(\%Imports \@fileNames $filename @componentNames)
sub addImport(\%\@$@) {
  my $target = shift(@_);
  my $fileNames = shift(@_);
  my $file = shift(@_);
  my @result = ();
  if (!defined($target->{$file})) {
    $target->{$file} = {read => false, imported => []};
    push @$fileNames, $file;
  }
  foreach my $component (@_) {
    # TODO: Add checking if component is already imported
    push(@{$target->{$file}->{imported}}, $component);
    push(@result, $component);
  }

  return ({ (%$target) }, [ (@$fileNames) ], (@result ? 
  sprintf("// REPLACED %s at %s\n", (@result > 1 ? sprintf("{$s}", join(", ", @result)) : $result[0] ), $file)
  : ""));
}

sub includeImports(\%\@) {
  my $imports = shift(@_);
  my $files = shift(@_);

  for my $file (@$files) {
    if ($imports->{$file}->{"read"}) {
      printf("// File: %s already imported\n", $file);
    } else {
      printf(STDERR "// %s from file \"%s\"\n", join(", ", %{$imports->{$file}}), $file);
      printf("// TODO: Add import of { %s } from %s\n", join(", ", @{$imports->{$file}->{imported}}), $file);
    }
  }
}

my @modes = [];
while (<>) {
  if ($mode eq "imports") {
    if (/^\s*import\s+(?<alias>\w+)\s+from\s+'(?<file>.*?.jsx)'\s*+(?<postmatch>(?:\/\/|\/\*|;).*)$/) {
      my ($alias, $file, $remainder) = ($+{alias}, $+{file}, $+{postmatch});
      printf STDERR "%s at %s\n", $alias, $file;
      ($imported, $files, $result) = addImport(%imported, @files, $file, $alias);
      %imported = %$imported;
      @files = @$files;
      printf("%s\n", $result);

      # Handling the remainder.
      if ($remainder =~ /\/\*/) {
        push(@modes, $mode);
        $mode = "comment";
      }
      print($remainder);
    } elsif (/^\s*import\s+\{\s*(?<imported>(?:\w+(?:\s+as\s+\w+)?)(\,\s*(?:\w+(?:\s+as\s+\w+)?))*)\s*\}\s+from\s+'(?<file>.*?.jsx)'\s*(?:\/\/|\/\*|;|$)/) {
      # Handling multiple variable import
      my ($imported, $default, $file) = ($+{imported}, $+{default}, $+{file});
      my @imported = ();
      for my $import (split(/\s*\,\s*/, $imported)) {
        if ($import =~ /(?<name>)\s+as\s+(?<alias>\w+)/) {
          # Alias.
          push(@imported, $+{alias});
        } else {
          # just name.
          push(@imported, $import);
        }
      }

      # TODO: Add support for default aliasing. (default as alias)

      # Adding the aliases.
      addImport(%imported, @files, @imported);
      printf("Replaced @s from %s\n", @imported, $file);
    } elsif (/^\s*import\s+/) {
      # Other kind of import.
      print($_);
    } elsif (/^\s*\/\*.*\*\/\s*$/ || /^\s*(?:\/\/|$)/) {
      # An empty line or a comment line.
      print($_);
    } elsif (/^.*\/\*.*$/) {
      # Moving to multiline comment mode.
      print($+{"prematch"});
      push(@modes, $mode);
      $mode = "comment";
    } else {
      # The imports ended.
      print(includeImports(%imports, @files));
      print($_);
      $mode = pop(@modes);
    }
  } elsif ($mode eq "comment") {
    if (/^.*?\*\/\s*(?<postmatch>.*?)$/) {
      # End of comment block.
      $mode = pop(@modes);

      if ($+{postmatch} && $mode eq "imports") {
        # Closing build mode as the line did not just have end of comment
        print(includeImports(%imports, @files));

        # Moving to previous mode.
        $mode = pop(@modes);
      }
    } else {
      print($_);
    }
  } else {
    # No more imports
    print($_);
  }
}
if ($mode eq "imports") {
  # Perform replacing.
  print(includeImports(%imports, @files));
}
