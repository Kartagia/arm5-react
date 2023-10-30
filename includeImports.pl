use utf8;
use English;
use IO::File;
use Carp;
use UNIVERSAL;

##
## PERL script constructing a file with imports of JSX components replaced with 
## imported JSX definition.
##
## The JSX file is assumed to contain only the exported JSX components.

my $mode = "imports";
my %imported = {};

our $JSX_DEFAULT_IMPORT = qr/^\s*import\s+(?<alias>\w+)\s+from\s+'(?<file>.*?.jsx)'\s*+(?<postmatch>(?:\/\/|\/\*|;).*)?$/;

our $JSX_MULTIPLE_IMPORT = qr/^\s*import\s+\{\s*(?<imported>(?:\w+(?:\s+as\s+\w+)?)(\,\s*(?:\w+(?:\s+as\s+\w+)?))*)\s*\}\s+from\s+'(?<file>.*?.jsx)'\s*(?<postmatch>(?:\/\/|\/\*|;).*)?$/;

our $SINGLE_LINE_COMMENT = qr/^\s*(?:\/\/.*|\/*.*?\*\/.*)$/;

our $COMMENT_START = qr/^(?<prematch>.*?)\/\*/;

our $COMMENT_END = qr/^.*?\*\/(?<postmatch>.*)$/;

our $JS_IMPORT = qr/^\s*import\s+\{\s*(?<imported>(?:\w+(?:\s+as\s+\w+)?)(\,\s*(?:\w+(?:\s+as\s+\w+)?))*)\s*\}\s+from\s+'(?<file>.*?)'\s*(?<postmatch>(?:\/\/|\/\*|;).*)?$/;

our $JS_DEFAULT_IMPORT = qr/^\s*import\s+(?<alias>\w+)\s+from\s+'(?<file>.*?)'\s*+(?<postmatch>(?:\/\/|\/\*|;).*)?$/;

sub is_array {
  return UNIVERSAL::isa($_[0], "ARRAY");
}

sub is_hash {
  return UNIVERSAL::isa($_[0], "HASH");
}

# PROTO: hasImport(\%Imports, $filename, $import)
# PARAMETERS: 
#  %imports: The import structrure.
#  $filename: The file name of the import.
#  $import: Imported element as scalar or a two elemeent array with imported eleement and alias. 
# RETURN
#  True, if and only if the given import is already reserved.
sub hasImport(\%$$) {
  my($target, $file, $import) = (@_);
  if (is_array($import)) {
    # Import is alias - existenze of either alias or original causes import to exist.
    return (exists ($target->{$file})) && ((exists ($target->{$file}->{$import->[0]})) || 
    (exists ($target->{$file}->{$import->[1]})) );
  } else {
    # IMport is scalar.
    return (exists $target->{$file} && exists $target->{$file}->{$import});
  }
}

# PROTO: hasAlias(%imports, $file, $import)
#  %imports: The import structrure.
#  $filename: The file name of the import.
#  $import: Imported element as scalar or a two elemeent array with imported eleement and alias. 
# RETURNS
#  TRue, if and only if the imports contains the alias of the import. For scalar import this is
#  equal to the hasImport. 
sub hasAlias(\%$$) {
  my($target, $file, $import) = (@_);
  if (hasImport(%$target, $file, $import)) {
    if (is_array($import)) {
      # Import is alias - existenze of either alias or original causes import to exist.
      return (exists $target->{$file} && (exists $target->{$file}->{$import->[1]}));
    } else {
      # Import is scalar.
      return (exists $target->{$file} && exists $target->{$file}->{$import});
    }
  } else {
    return 0;
  }
}

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

# PROTO: readJSXFile($inh, %inputs, @filenames)
# PARAMETERS
#  $inh: IO::File: The input handle from which the JSX file is read.
#  $outh: IO::File: The output handle into which the result javascript file is compiled. If undefined,
#   nocompilation is performed. 
#  %inputs: HASH from filenames to import structures. 
#  @files: ARRAY of filenames. The order of loading the filenames.
#  %options: The options. 
# RETURNS
#  Files: The list of files in the order of loading (new file is added to the beginning of the list)
# DESCRIPTION
#  Reads the input file, and collects all of its imports and exports into the 
# inputs structure.
sub readJSXFile($$\%\@;\%) {
  my $inh = shift(@_);
  my $outh = shift(@_);
  my %imports = %{$_[1]};
  my @files = @{$_[2]};
  my %options = %{$_[3] || {}};

  my $line;
  my $mode = "imports";
  my @modes = [];
  while ( $line = $inh->readline()) {
    if ($mode eq "imports") {
      # We have a JSX import.
      if ($line =~ $JSX_DEFAULT_IMPORT) {
        if (!hasImport(%imports, $file, $alias)) {
          # Adding a new import.
          addImport(%imports, @files, $file, $alias);
          
          # Processing the imported file.
          eval {
            my $importedFile = IO::File->new($file, "r");
            readJSXFile($importedFile, $outh, %imports, @files, %options);
          };
          
          if (my $err = $@) {
            confess "Could not read the file $file due $err";
          }
        }
      } elsif ($line =~ $JSX_MULTIPLE_IMPORT) {

      } elsif ($line =~ $JS_IMPORT) { 
        
        if ($options{writeImports}) {
          # Writing imports - the JS import si only written, if it is not yet imported.
          my ($imports, $default, $file) = %+{"imports", "default", "file"};
          if ($imports{imports}->{$file}) {
            # The import is imported.
            if ($imports) {
              # Dealing with aliases.
              for my $import (split(/\s*,\s*/, $imports)) {
                # Splitting imports.

              }
              if ($default) {
                if (hasImport(%$imports, $file, $default)) {
                  # Default is not part of the imports.
                  printf("const %s = %s;", $default, $imports{imports}->{$file}->{imports}[0]);
                } else {
                  printf("%s\n", $line);
                }
              }
            }
          }
        }  
      }
    } elsif ($mode eq "comment") {
      if ($line =~ $COMMENT_END) {
        my $postMatch = $+{postmatch};
        $mode = pop(@modes);
        if ($mode eq "imports" && $postMatch) {
          # The imports ends - performing writing of imports, if the option write imports is set.
          if ($options{writeImports}) {
            addImports(%imports, @files);
          }
        }
      }
    }
  }

  return ( @files );
}

sub getIncludes($) {
  my $include = shift(@_);
  my $arrayRefImport = sub ($a) {
    if (is_array($a)) {
      if ($#{$a} >= 1) {
        return sprintf("%s as %s", $a->[0], $a->[1]);
      } elsif ($#{$a} == 0) {
        return $a->[0];
      } else {
        die("Invalid import - not an two element array.")
      }
    } else {
      return $a;
    }
  };
  if (is_array($include)) {
    my $imports = $include->[0];
    if (is_array($imports)) {
      # We do have multiple imports.
      if ($#{$imports} > 0) {
        return sprintf("{%s}", join(", ", map($arrayRefImport, @$imports)));
      } else {
        return $imports->[0];
      }
    } elsif (is_hash($imports)) {
      # We do have multiple imports and a default import.
      if (exists $imports->{default} && exists $imports->{imports}) {
        # Both
        return sprintf("%s, %s", 
        $imports->{default}, getIncludes(@{$imports->{imports}}));
      } elsif (exists $imports->{default}) {
        # Only default.
        return sprintf("%s", $imports->{default});
      } else {
        # Only import block.
        return getIncludes(@{$imports->{imports}});
      }
    }
  } else {
    confess("An invalid import $include");
  }
}

sub getSource($) {
  my $include = shift(@_);
  if (is_array($include)) {
    return $include->[1];   
  } else {
    confess("An invalid import $include");
  }

}

## Write imports to the current location.
## * All Imports of JSX files has been procesed, thus we does not need to process the files.
sub includeImports(\%\@) {
  my $imports = shift(@_);
  my $files = shift(@_);

  my $outh = IO::Handle->new();
  $outh->fdopen(fileno(STDOUT), "a") || confess("Could not open standard output for writing");

  $outh->printf("// BEGIN: Included component imports\n");

  # Writing the imports for the imported files.
  if (exists $imports->{includes}) {
    for my $include (@${imports->{includes}}) {
      $outh->printf("import %s from '%s';\n", getIncludes($include), getSource($include));
    }
  }

  # Reading the imported procedures.
  for my $file (@$files) {
    
  }

  $outh->printf("// END: Included component imports\n");
  $outh->flush();
  $outh->close();
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
      # TODO: This does not work. The regexp returns invalid imported.
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
