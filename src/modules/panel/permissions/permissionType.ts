// enum of every permission type
// DO NOT REORDER OR REMOVE ANY ENUMS, ONLY ADD NEW ONES TO THE END
export enum PermissionType {
    Login, // login to the panel

    Warn, // warn a user
    Mute, // mute a user
    Kick, // kick a user
    Ban, // ban a user
    Unban, // unban a user
    Unmute, // unmute a user

    Moderation, // moderation permissions, like spectate and teleport

    ReportBlacklist, // blacklist
    MarkActionUnnappealable, // mark an action as unnappealable

    ManagePermissions, // manage permissions
    ManageRoles, // manage roles

    MarkConfidential, // mark a report as confidential
    ViewConfidential, // view a confidential report

    ViewAuditLogs, // view audit logs

}