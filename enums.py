import enum


# https://docs.python.org/3/library/enum.html#autonumber
class AutoNumber(enum.Enum):
    def __new__(cls):
        value = len(cls.__members__) + 1
        obj = object.__new__(cls)
        obj._value_ = value
        return obj


class BoardTypes(AutoNumber):
    Luxor = ()
    Tower = ()
    American = ()
    Festival = ()
    Worldwide = ()
    Continental = ()
    Imperial = ()
    NothingYet = ()
    CantPlayEver = ()
    IHaveThis = ()


class CommandsToClient(AutoNumber):
    SetClientIdToUsername = ()
    SetClientIdToRoom = ()


class CommandsToServer(AutoNumber):
    SetUsername = ()
