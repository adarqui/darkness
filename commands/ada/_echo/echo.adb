with Ada.Command_Line; use Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;

procedure Echo is
  opt_n : Boolean := True;
  start_index : Integer := 1;
begin

  if Argument_Count > 0 and then Argument(1) = "-n"
  then
    opt_n := False;
    start_index := 2;
  end if;

  for index in start_index..Argument_Count loop
    Put(Argument(index));
    if index /= Argument_Count
    then
      Put(" ");
    end if;
  end loop;

  if opt_n = True
  then
    New_Line;
  end if;

end;
