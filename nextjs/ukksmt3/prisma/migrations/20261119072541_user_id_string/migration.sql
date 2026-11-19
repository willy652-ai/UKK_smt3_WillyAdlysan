/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(10) NOT NULL,
    ADD PRIMARY KEY (`id`);

CREATE TEMPORARY TABLE `user_id_mapping` AS
SELECT
    `id` AS `old_id`,
    CONCAT(
        CASE WHEN `role` = 'admin' THEN 'ADM' ELSE 'STF' END,
        LPAD(ROW_NUMBER() OVER (PARTITION BY `role` ORDER BY CAST(`id` AS UNSIGNED)), 4, '0')
    ) AS `new_id`
FROM `users`
WHERE `id` REGEXP '^[0-9]+$';

UPDATE `users`
JOIN `user_id_mapping` ON `users`.`id` = `user_id_mapping`.`old_id`
SET `users`.`id` = `user_id_mapping`.`new_id`;

DROP TEMPORARY TABLE `user_id_mapping`;
